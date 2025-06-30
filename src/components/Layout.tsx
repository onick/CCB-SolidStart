import { Component } from 'solid-js';
import { useLocation } from '@solidjs/router';

const Layout: Component = (props: any) => {
  const location = useLocation();
  
  return (
    <div class="app">
      <main class="main-content">
        {props.children}
      </main>
    </div>
  );
};

export default Layout;
