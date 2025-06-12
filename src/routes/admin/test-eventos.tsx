import { Component } from 'solid-js';
import AdminLayout from '../../components/AdminLayout';

const TestEventos: Component = () => {
  return (
    <AdminLayout currentPage="eventos">
      <div style="padding: 20px;">
        <h1>🎉 TEST EVENTOS - FUNCIONANDO</h1>
        <p>Si ves esto, el routing funciona correctamente.</p>
      </div>
    </AdminLayout>
  );
};

export default TestEventos;
