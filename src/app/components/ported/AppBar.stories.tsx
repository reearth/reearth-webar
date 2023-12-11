import type { Meta, StoryObj } from '@storybook/react';
import { AppBar } from "./AppBar";
import { Space } from "./Space";
import { IconButton } from '@mui/material';
import { 
  HandIcon, 
  InfoIcon, 
  LayerIcon,
  VisibilityOnIcon
} from './icons';

const meta = {
  title: 'Components/AppBar',
  component: AppBar,
} satisfies Meta<typeof AppBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NavBar: Story = {
  render: () => (
    <AppBar>
      <IconButton>
        <InfoIcon />
      </IconButton>
      <Space flexible />
      <IconButton>
        <LayerIcon />
      </IconButton>
      <IconButton>
        <HandIcon />
      </IconButton>
      <IconButton>
        <VisibilityOnIcon />
      </IconButton>
    </AppBar>
  )
};
