interface WelcomeCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

export default function WelcomeCard(props: WelcomeCardProps) {
  return (
    <div class="option-card" onClick={props.onClick}>
      <div class="option-icon">
        <i class={props.icon}></i>
      </div>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </div>
  );
}