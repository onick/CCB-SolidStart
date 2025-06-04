import { JSX } from 'solid-js';

interface WelcomeCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  onClick: () => void;
}

export default function WelcomeCard(props: WelcomeCardProps) {
  return (
    <div class="option-card" onClick={props.onClick}>
      <div class="option-icon">
        {props.icon}
      </div>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </div>
  );
}