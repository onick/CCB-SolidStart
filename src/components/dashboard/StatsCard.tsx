import { Component, JSX } from 'solid-js';

interface StatsCardProps {
  title: string;
  value: string | number;
  label: string;
  change: string;
  icon: Component<any>;
  iconColor: 'blue' | 'purple' | 'teal' | 'orange' | 'green' | 'red';
  isLoading?: boolean;
}

const StatsCard: Component<StatsCardProps> = (props) => {
  const formatValue = () => {
    if (props.isLoading) return '...';
    if (typeof props.value === 'number') {
      return props.value.toLocaleString();
    }
    return props.value;
  };

  return (
    <div class="stat-card">
      <div class="stat-header">
        <div>
          <div class="stat-title">{props.title}</div>
        </div>
        <div class={`stat-icon ${props.iconColor}`}>
          <props.icon size={20} color="white" />
        </div>
      </div>
      <div class="stat-number">{formatValue()}</div>
      <div class="stat-label">{props.label}</div>
      <div class="stat-change positive">↗ {props.change}</div>
    </div>
  );
};

export default StatsCard;