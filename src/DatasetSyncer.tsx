import { useAtomValue } from "jotai";
import queryString from "query-string";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { resetTileset } from "./ar";
import { LayersRenderer, useAddLayer } from "./components/prototypes/layers";
import { arStartedAtom } from "./components/prototypes/view/states/ar";
import { useDatasetsByIds } from "./components/shared/graphql";
import { PlateauDataset, PlateauDatasetItem } from "./components/shared/graphql/types/catalog";
import { rootLayersAtom } from "./components/shared/states/rootLayer";
import { settingsAtom } from "./components/shared/states/setting";
import { templatesAtom } from "./components/shared/states/template";
import { createRootLayerAtom } from "./components/shared/view-layers";
import { layerComponents } from "./components/shared/view-layers/layerComponents";
import { LoadedTileset } from "./components/shared/types";

// クエパラとデータセットパネルの間の双方向同期ならびにタイルセット描画更新を行うためのヘッドレス(非表示)コンポーネント
export default function DatasetSyncer({...props}) {
  // クエパラ監視フック
  const [searchParams, setSearchParams] = useSearchParams();
  // クエパラで指定されたデータセットID群をStateで持ってuseDatasetsByIdsをトリガーする↓
  const [datasetIds, setDatasetIds] = useState<string[]>([]);
  // データセットID群をもとにカタログからデータセット群を取得 (↑datasetIdsが更新されればトリガー)
  const { data } = useDatasetsByIds(datasetIds);
  // useDatasetsByIdsから抽出したデータセット群
  const [datasets, setDatasets] = useState<PlateauDataset[]>([]);
  // ARで使用不可能なデータセットを弾いたデータセット群
  // クエパラを反映した初期化が完了するまではrootLayersによるフックを作動させないためのフラグとしても使用する
  // そのため敢えて配列で初期化せずにudefinedとなるようにしていることに注意
  const [filteredDatasets, setFilteredDatasets] = useState<PlateauDataset[]>();
  // データセットパネルと同期されるレイヤー群とその関連フック
  const rootLayers = useAtomValue(rootLayersAtom);
  const addLayer = useAddLayer();
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);
  // ARロジックが開始・準備完了しているか
  const arStarted = useAtomValue(arStartedAtom);

  const [tilesets, setTilesets] = useState<LoadedTileset[]>([]);

  // クエパラが変化したらデータセットID群を取得・保存して本コンポーネントを再レンダリング
  useEffect(() => {
    // クエパラはこんな感じで来る ?dataList=[{"datasetId":"d_13101_bldg","dataId":"di_13101_bldg_LOD1"}]
    // データセットIDのみ使用する。複数来る場合はこんな感じ ?dataList=[{"datasetId":"d_14136_bldg"},{"datasetId":"d_14135_bldg"}]
    const dataList = searchParams.get("dataList");
    try {
      if (!dataList) { throw "クエリパラメータが空です" }
      if (typeof dataList === 'string') {
        const evaled: any[] = eval(dataList);
        if (evaled) {
          const datasetIds = evaled.map(x => x.datasetId);
          console.log("New Dataset Ids: ", datasetIds);
          setDatasetIds(datasetIds);
        } else {
          throw "単一のパラメータが評価できません";
        }
      } else {
        throw "指定のキーを持つ単一のパラメータではありません";
      }
    } catch(e) {
      console.log("クエリパラメータが取得できません");
      console.log(e);
      setDatasetIds([]);
    }

    return () => {
      // setDatasetIds([]);
    };
  }, [searchParams]);

  // データセットID群が変化したらuseDatasetsByIdsを用いてカタログからデータセット群を取得・保存して本コンポーネントを再レンダリング
  useEffect(() => {
    // カタログからデータセット群を取得できていない間も何度かコールされるのでその間は何もしない
    if (!data || !data.nodes || !data.nodes.length) { return; }
    // データセット群を抽出
    const plateauDatasets = data.nodes as PlateauDataset[];
    console.log("New Datasets: ", plateauDatasets);
    setDatasets(plateauDatasets);
  
    return () => {
      // setDatasets([]);
    };
  }, [data]);

  // データセット群が変化したらARで使用可能なデータセットだけにフィルタ・保存して本コンポーネントを再レンダリング
  useEffect(() => {
    // TODO: ここでdatasetのTypeが対応していないものであればアラートポップアップを出し除外する
    const removedDatasets = datasets.filter(dataset => dataset.type.code !== 'bldg');
    const filteredDatasets = datasets.filter(dataset => dataset.type.code === 'bldg');
  
    if (removedDatasets.length > 0) {
      const removedNames = removedDatasets.map(item => item.name).join(', ');
      console.log(`${removedNames} はAR非対応のため非表示になります。`); // ポップアップメッセージを設定
    }

    console.log("New Filterd Datasets: ", filteredDatasets);
    setFilteredDatasets(filteredDatasets);
  
    return () => {
      // setFilteredDatasets([]);
    };
  }, [datasets]);

  // フィルタ済データセット群が変化したらデータセットパネルに同期して本コンポーネントを再レンダリング
  useEffect(() => {
    // クエパラからのデータセット変換が完了するまではスルー
    if (!filteredDatasets) { return; }

    // 既にデータセットパネルで選択されているレイヤーは追加対象から除外
    const rootLayersDatasetIds = rootLayers.map(rootLayer => rootLayer.rawDataset.id);
    const uniqueDatasets = filteredDatasets.filter(dataset => !rootLayersDatasetIds.includes(dataset.id));

    uniqueDatasets.map(dataset => {
      const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
      addLayer(
        createRootLayerAtom({
          dataset,
          settings: filteredSettings,
          templates,
          areaCode: dataset.wardCode,
        }),
        // { autoSelect: !smDown }, // TODO: ここの挙動追う
      );
    });
  
    return () => {
      // setFilteredDatasets([]);
    };
  }, [filteredDatasets]);

  // フィルタ済データセット群が変化したらタイルセット描画をリセットして本コンポーネントを再レンダリング
  useEffect(() => {
    // クエパラからのデータセット変換が完了するまではスルー
    if (!filteredDatasets) { return; }

    // データセット群をタイルセットURL群に変換
    const tilesetConfigs = filteredDatasets.map(plateauDataset => {
      const plateauDatasetItems = plateauDataset.items as PlateauDatasetItem[];
      // LOD2(テクスチャあり)->LOD2(テクスチャなし)->LOD1の順でフォールバック
      const tilesetUrlLod2TexItem = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "TEXTURE")
      if (tilesetUrlLod2TexItem && tilesetUrlLod2TexItem.url) {
        return {url: tilesetUrlLod2TexItem.url, id: plateauDataset.id};
      } else {
        const tilesetUrlLod2NoneTexItem = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "NONE")
        if (tilesetUrlLod2NoneTexItem && tilesetUrlLod2NoneTexItem.url) {
          return {url: tilesetUrlLod2NoneTexItem.url, id: plateauDataset.id};
        } else {
          const tilesetUrlLod1Item = plateauDatasetItems.find(({ lod }) => lod == 1)
          if (tilesetUrlLod1Item && tilesetUrlLod1Item.url) {
            return {url: tilesetUrlLod1Item.url, id: plateauDataset.id};
          } else {
            return null;
          }
        }
      }
    }).filter(x => x);
  
    // tilesetをリセット
    if (!tilesetConfigs || !arStarted) { return; }
    resetTileset(tilesetConfigs.map(t => t.url)).then((tilesets: LoadedTileset[]) => {
      setTilesets(tilesets.map(t => ({ ...t, id: tilesetConfigs.find(c => c.url === t.url).id })));
    });
  
    return () => {
      // resetTileset([]);
    };
  }, [filteredDatasets]);

  // データセットパネルのレイヤー群が変化したらクエパラを更新して本コンポーネントを再レンダリング
  useEffect(() => {
    // クエパラからデータセット変換を行いデータセットパネル(rootLayers)へ反映するまでは、rootLayersに反応させたクエパラ変更を行わない
    // この回避を入れておかないと、クエパラ付きでアクセスしても初めはrootLayersが空であることから本後続処理にてクエパラがクリアされてしまう
    if (!filteredDatasets) { return; }

    // データセットパネルで何も選択されていない場合はクエパラをクリア
    if (!rootLayers.length) {
      setSearchParams({});
      return;
    }

    // データセットパネルで何かしら選択されている場合はクエパラに反映
    const datasetIds = rootLayers.map(rootLayer => rootLayer.rawDataset.id);
    const objs = datasetIds.map(id => {
      const mapped = new Map([["datasetId", id]]);
      const obj = Object.fromEntries(mapped);
      return obj;
    });
    const datasetIdsObjsStr = JSON.stringify(objs);
    setSearchParams({dataList: datasetIdsObjsStr});

    return () => {
      // setSearchParams({});
    };
  }, [rootLayers]);

  return (
    <div id="dataset_syncer" {...props}>
      <LayersRenderer tilesets={tilesets} components={layerComponents} />
    </div>
  )
}