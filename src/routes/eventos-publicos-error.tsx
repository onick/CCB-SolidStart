import { createSignal, onMount, For, Show, createEffect } from "solid-js";
import { FaSolidCalendar, FaSolidClock, FaSolidMapPin, FaSolidUsers, FaSolidFilter, FaSolidMagnifyingGlass, FaSolidHome, FaSolidSync } from "solid-icons/fa";
import { eventosService, registroEventosService, visitantesService, forceInvalidateCache } from '../lib/supabase/services';
import '../styles/global.css';
import '../styles/tailwind.css';
            </div>
          </div>
        </div>
      </header>

      {/* Navegación Principal - Título en Móvil */}
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <h2 class="text-xl font-bold text-gray-900 text-center">Próximas Actividades</h2>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div class="bg-white border-b border-gray-200 px-4 py-4">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-4">
            {/* Barra de Búsqueda */}
            <div class="flex-1 relative">
              <FaSolidMagnifyingGlass class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar eventos por título, descripción o categoría..."
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.target.value)}
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            {/* Botón Filtros */}
            <button class="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
              <FaSolidFilter class="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de Filtrado */}
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="max-w-7xl mx-auto">
          <div class="flex space-x-1">
            <button
              onClick={() => setActiveFilter('todos')}
              class={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter() === 'todos'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('en-curso')}
              class={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter() === 'en-curso'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              En curso
            </button>
            <button
              onClick={() => setActiveFilter('proximos')}
              class={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter() === 'proximos'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main class="max-w-7xl mx-auto px-4 py-8">
        {/* Loading */}
        <Show when={isLoading()}>
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 font-medium">Cargando eventos...</p>
          </div>
        </Show>

        {/* No events */}
        <Show when={!isLoading() && filteredEventos().length === 0}>
          <div class="text-center py-16">
            <div class="text-6xl mb-4">📅</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay eventos disponibles</h3>
            <p class="text-gray-600 mb-6">No se encontraron eventos activos en esta categoría.</p>
            <div class="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
              <p class="text-sm text-gray-700">
                💡 <strong>¿Esperando eventos nuevos?</strong><br/>
                Los eventos creados en el panel de administración aparecerán aquí automáticamente.
              </p>
            </div>
          </div>
        </Show>

        {/* Grid de Eventos */}
        <Show when={!isLoading() && filteredEventos().length > 0}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={filteredEventos()}>
              {(evento) => {
                const dateInfo = formatDate(evento.fecha);
                const statusInfo = getEventStatus(evento);
                const disponibilidad = obtenerEstadoDisponibilidad(evento);
                const categoryStyle = getCategoryStyle(evento.titulo);
                const porcentajeOcupacion = ((evento.registrados || 0) / (evento.capacidad || 200)) * 100;

                return (
                  <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                    {/* Header de la Card con Imagen/Gradiente */}
                    <div 
                      class="relative h-48 flex items-center justify-center"
                      style={{
                        background: evento.imagen 
                          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${evento.imagen}')` 
                          : categoryStyle.bg,
                        'background-size': 'cover',
                        'background-position': 'center'
                      }}
                    >
                      {/* Badge de Categoría */}
                      <div class="absolute top-4 left-4">
                        <span class="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          {categoryStyle.label}
                        </span>
                      </div>

                      {/* Badge de Estado */}
                      <div class="absolute top-4 right-4">
                        <span 
                          class="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: statusInfo.color,
                            'background-color': statusInfo.bgColor
                          }}
                        >
                          {statusInfo.status}
                        </span>
                      </div>

                      {/* Fecha Destacada */}
                      <div class="text-center text-white">
                        <div class="text-3xl font-bold">{dateInfo.day}</div>
                        <div class="text-sm font-medium">{dateInfo.month}</div>
                      </div>
                    </div>

                    {/* Contenido de la Card */}
                    <div class="p-6">
                      {/* Título del Evento */}
                      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {evento.titulo}
                      </h3>

                      {/* Descripción */}
                      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                        {evento.descripcion}
                      </p>

                      {/* Información del Evento */}
                      <div class="space-y-2 mb-4">
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidCalendar class="w-4 h-4 mr-2 text-cyan-500" />
                          {dateInfo.fechaCompleta}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidClock class="w-4 h-4 mr-2 text-cyan-500" />
                          {formatTime(evento.hora)}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidMapPin class="w-4 h-4 mr-2 text-cyan-500" />
                          {evento.ubicacion}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidUsers class="w-4 h-4 mr-2 text-cyan-500" />
                          {evento.registrados || 0} / {evento.capacidad || 200} registrados
                        </div>
                      </div>

                      {/* Barra de Progreso de Capacidad */}
                      <div class="mb-4">
                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Capacidad</span>
                          <span>{Math.round(porcentajeOcupacion)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            class={`h-2 rounded-full transition-all duration-500 ${
                              porcentajeOcupacion >= 90 ? 'bg-red-500' :
                              porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Estado de Disponibilidad */}
                      <div class="mb-4">
                        <div 
                          class="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium"
                          style={{
                            color: disponibilidad.color,
                            'background-color': disponibilidad.bgColor
                          }}
                        >
                          <span class="mr-2">{disponibilidad.icono}</span>
                          {disponibilidad.mensaje}
                        </div>
                      </div>

                      {/* Botón de Acción */}
                      <Show when={disponibilidad.disponible}>
                        <button 
                          onClick={() => openRegistroModal(evento)}
                          class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {evento.precio > 0 ? `Registrarse - $${evento.precio}` : 'Entrada Libre'}
                        </button>
                      </Show>

                      <Show when={!disponibilidad.disponible}>
                        <button 
                          disabled
                          class="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                        >
                          {disponibilidad.estado === 'finalizado' ? 'Evento Finalizado' : 'Evento Agotado'}
                        </button>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </main>

      {/* Modal de Registro */}
      <Show when={showRegistroModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              {/* Header del Modal */}
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900">Registro al Evento</h3>
                <button 
                  onClick={() => setShowRegistroModal(false)}
                  class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Información del Evento */}
              <Show when={selectedEvento()} keyed>
                {(evento) => {
                  const dateInfo = formatDate(evento.fecha);
                  const disponibilidad = obtenerEstadoDisponibilidad(evento);
                  
                  return (
                    <div class="mb-6">
                      <div class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-lg mb-4">
                        <h4 class="font-bold text-lg mb-2">{evento.titulo}</h4>
                        <div class="space-y-1 text-sm">
                          <div class="flex items-center">
                            <FaSolidCalendar class="w-4 h-4 mr-2" />
                            {dateInfo.fechaCompleta}
                          </div>
                          <div class="flex items-center">
                            <FaSolidClock class="w-4 h-4 mr-2" />
                            {formatTime(evento.hora)}
                          </div>
                          <div class="flex items-center">
                            <FaSolidMapPin class="w-4 h-4 mr-2" />
                            {evento.ubicacion}
                          </div>
                        </div>
                      </div>

                      {/* Estado de Disponibilidad */}
                      <div 
                        class="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium mb-4"
                        style={{
                          color: disponibilidad.color,
                          'background-color': disponibilidad.bgColor
                        }}
                      >
                        <span class="mr-2">{disponibilidad.icono}</span>
                        {disponibilidad.mensaje}
                      </div>
                    </div>
                  );
                }}
              </Show>

              {/* Formulario de Registro */}
              <div class="space-y-4">
                {/* Búsqueda de Visitante */}
                <div class="border-b border-gray-200 pb-4">
                  <button 
                    onClick={() => setShowVisitorSearch(!showVisitorSearch())}
                    class="w-full text-left text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    📋 ¿Ya tienes datos guardados? Búscalos aquí
                  </button>
                  
                  <Show when={showVisitorSearch()}>
                    <div class="mt-3 space-y-3">
                      <input
                        type="text"
                        placeholder="Ingresa tu email o teléfono"
                        value={searchValue()}
                        onInput={(e) => setSearchValue(e.target.value)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                      <button 
                        onClick={() => {
                          // Implementar búsqueda de visitante
                          const valor = searchValue().trim();
                          if (!valor) {
                            alert('❌ Por favor, ingresa tu email o teléfono.');
                            return;
                          }
                          // Aquí iría la lógica de búsqueda
                          alert('🔍 Función de búsqueda implementada en la versión completa.');
                        }}
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        🔍 Buscar mis datos
                      </button>
                    </div>
                  </Show>
                </div>

                {/* Campos del Formulario */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={registroData().nombre}
                    onInput={(e) => handleInputChange('nombre', e.target.value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registroData().email}
                    onInput={(e) => handleInputChange('email', e.target.value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={registroData().telefono}
                    onInput={(e) => handleInputChange('telefono', e.target.value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="(000) 000-0000"
                  />
                </div>

                {/* Botones de Acción */}
                <div class="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowRegistroModal(false)}
                    class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleRegistro}
                    disabled={!validarFormulario()}
                    class={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      validarFormulario()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Registro
                  </button>
                </div>

                {/* Nota Informativa */}
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p class="text-xs text-blue-700">
                    💡 <strong>Importante:</strong> Recibirás un código único para hacer check-in el día del evento. 
                    Guarda bien este código ya que lo necesitarás para ingresar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EventosPublicos;                  src="/images/logo.png" 
                  alt="CCB" 
                  class="w-10 h-10 object-contain rounded-full"
                />
              </div>
              <div>
                <h1 class="text-xl font-bold">Centro Cultural Banreservas</h1>
                <p class="text-cyan-100 text-sm hidden sm:block">Sistema de Gestión de Eventos</p>
              </div>
            </div>

            {/* Navegación Central - Solo en Desktop */}
            <div class="hidden lg:block">
              <h2 class="text-2xl font-bold text-center">Próximas Actividades</h2>
            </div>

            {/* Botones y Reloj */}
            <div class="flex items-center space-x-3">
              <button 
                onClick={mostrarHistorialRegistros}
                class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                📋 Mis Registros
              </button>
              <button 
                onClick={recargarEventos}
                class="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                disabled={isLoading()}
              >
                <FaSolidSync class={`w-4 h-4 ${isLoading() ? 'animate-spin' : ''}`} />
              </button>
              <div class="text-right">
                <div class="text-lg font-bold">{currentTime()}</div>
                <div class="text-xs text-cyan-100">Hora actual</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación Principal - Título en Móvil */}
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <h2 class="text-xl font-bold text-gray-900 text-center">Próximas Actividades</h2>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div class="bg-white border-b border-gray-200 px-4 py-4">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-4">
            {/* Barra de Búsqueda */}
            <div class="flex-1 relative">
              <FaSolidMagnifyingGlass class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar eventos por título, descripción o categoría..."
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.target.value)}
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            {/* Botón Filtros */}
            <button class="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
              <FaSolidFilter class="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de Filtrado */}
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="max-w-7xl mx-auto">
          <div class="flex space-x-1">
            <button
              onClick={() => setActiveFilter('todos')}
              class={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter() === 'todos'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('en-curso')}
              class={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter() === 'en-curso'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              En curso
            </button>
            <button
              onClick={() => setActiveFilter('proximos')}
              class={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter() === 'proximos'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main class="max-w-7xl mx-auto px-4 py-8">
        {/* Loading */}
        <Show when={isLoading()}>
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 font-medium">Cargando eventos...</p>
          </div>
        </Show>

        {/* No events */}
        <Show when={!isLoading() && filteredEventos().length === 0}>
          <div class="text-center py-16">
            <div class="text-6xl mb-4">📅</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay eventos disponibles</h3>
            <p class="text-gray-600 mb-6">No se encontraron eventos activos en esta categoría.</p>
            <div class="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
              <p class="text-sm text-gray-700">
                💡 <strong>¿Esperando eventos nuevos?</strong><br/>
                Los eventos creados en el panel de administración aparecerán aquí automáticamente.
              </p>
            </div>
          </div>
        </Show>

        {/* Grid de Eventos */}
        <Show when={!isLoading() && filteredEventos().length > 0}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={filteredEventos()}>
              {(evento) => {
                const dateInfo = formatDate(evento.fecha);
                const statusInfo = getEventStatus(evento);
                const disponibilidad = obtenerEstadoDisponibilidad(evento);
                const categoryStyle = getCategoryStyle(evento.titulo);
                const porcentajeOcupacion = ((evento.registrados || 0) / (evento.capacidad || 200)) * 100;

                return (
                  <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                    {/* Header de la Card con Imagen/Gradiente */}
                    <div 
                      class="relative h-48 flex items-center justify-center"
                      style={{
                        background: evento.imagen 
                          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${evento.imagen}')` 
                          : categoryStyle.bg,
                        'background-size': 'cover',
                        'background-position': 'center'
                      }}
                    >
                      {/* Badge de Categoría */}
                      <div class="absolute top-4 left-4">
                        <span class="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          {categoryStyle.label}
                        </span>
                      </div>

                      {/* Badge de Estado */}
                      <div class="absolute top-4 right-4">
                        <span 
                          class="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: statusInfo.color,
                            'background-color': statusInfo.bgColor
                          }}
                        >
                          {statusInfo.status}
                        </span>
                      </div>

                      {/* Fecha Destacada */}
                      <div class="text-center text-white">
                        <div class="text-3xl font-bold">{dateInfo.day}</div>
                        <div class="text-sm font-medium">{dateInfo.month}</div>
                      </div>
                    </div>

                    {/* Contenido de la Card */}
                    <div class="p-6">
                      {/* Título del Evento */}
                      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {evento.titulo}
                      </h3>

                      {/* Descripción */}
                      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                        {evento.descripcion}
                      </p>

                      {/* Información del Evento */}
                      <div class="space-y-2 mb-4">
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidCalendar class="w-4 h-4 mr-2 text-cyan-500" />
                          {dateInfo.fechaCompleta}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidClock class="w-4 h-4 mr-2 text-cyan-500" />
                          {formatTime(evento.hora)}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidMapPin class="w-4 h-4 mr-2 text-cyan-500" />
                          {evento.ubicacion}
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                          <FaSolidUsers class="w-4 h-4 mr-2 text-cyan-500" />
                          {evento.registrados || 0} / {evento.capacidad || 200} registrados
                        </div>
                      </div>

                      {/* Barra de Progreso de Capacidad */}
                      <div class="mb-4">
                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Capacidad</span>
                          <span>{Math.round(porcentajeOcupacion)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            class={`h-2 rounded-full transition-all duration-500 ${
                              porcentajeOcupacion >= 90 ? 'bg-red-500' :
                              porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Estado de Disponibilidad */}
                      <div class="mb-4">
                        <div 
                          class="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium"
                          style={{
                            color: disponibilidad.color,
                            'background-color': disponibilidad.bgColor
                          }}
                        >
                          <span class="mr-2">{disponibilidad.icono}</span>
                          {disponibilidad.mensaje}
                        </div>
                      </div>

                      {/* Botón de Acción */}
                      <Show when={disponibilidad.disponible}>
                        <button 
                          onClick={() => openRegistroModal(evento)}
                          class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {evento.precio > 0 ? `Registrarse - $${evento.precio}` : 'Entrada Libre'}
                        </button>
                      </Show>

                      <Show when={!disponibilidad.disponible}>
                        <button 
                          disabled
                          class="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                        >
                          {disponibilidad.estado === 'finalizado' ? 'Evento Finalizado' : 'Evento Agotado'}
                        </button>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </main>

      {/* Modal de Registro */}
      <Show when={showRegistroModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              {/* Header del Modal */}
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900">Registro al Evento</h3>
                <button 
                  onClick={() => setShowRegistroModal(false)}
                  class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Información del Evento */}
              <Show when={selectedEvento()} keyed>
                {(evento) => {
                  const dateInfo = formatDate(evento.fecha);
                  const disponibilidad = obtenerEstadoDisponibilidad(evento);
                  
                  return (
                    <div class="mb-6">
                      <div class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-lg mb-4">
                        <h4 class="font-bold text-lg mb-2">{evento.titulo}</h4>
                        <div class="space-y-1 text-sm">
                          <div class="flex items-center">
                            <FaSolidCalendar class="w-4 h-4 mr-2" />
                            {dateInfo.fechaCompleta}
                          </div>
                          <div class="flex items-center">
                            <FaSolidClock class="w-4 h-4 mr-2" />
                            {formatTime(evento.hora)}
                          </div>
                          <div class="flex items-center">
                            <FaSolidMapPin class="w-4 h-4 mr-2" />
                            {evento.ubicacion}
                          </div>
                        </div>
                      </div>

                      {/* Estado de Disponibilidad */}
                      <div 
                        class="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium mb-4"
                        style={{
                          color: disponibilidad.color,
                          'background-color': disponibilidad.bgColor
                        }}
                      >
                        <span class="mr-2">{disponibilidad.icono}</span>
                        {disponibilidad.mensaje}
                      </div>
                    </div>
                  );
                }}
              </Show>

              {/* Formulario de Registro */}
              <div class="space-y-4">
                {/* Búsqueda de Visitante */}
                <div class="border-b border-gray-200 pb-4">
                  <button 
                    onClick={() => setShowVisitorSearch(!showVisitorSearch())}
                    class="w-full text-left text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    📋 ¿Ya tienes datos guardados? Búscalos aquí
                  </button>
                  
                  <Show when={showVisitorSearch()}>
                    <div class="mt-3 space-y-3">
                      <input
                        type="text"
                        placeholder="Ingresa tu email o teléfono"
                        value={searchValue()}
                        onInput={(e) => setSearchValue(e.target.value)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                      <button 
                        onClick={() => {
                          // Implementar búsqueda de visitante
                          const valor = searchValue().trim();
                          if (!valor) {
                            alert('❌ Por favor, ingresa tu email o teléfono.');
                            return;
                          }
                          // Aquí iría la lógica de búsqueda
                          alert('🔍 Función de búsqueda implementada en la versión completa.');
                        }}
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        🔍 Buscar mis datos
                      </button>
                    </div>
                  </Show>
                </div>

                {/* Campos del Formulario */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={registroData().nombre}
                    onInput={(e) => handleInputChange('nombre', e.target.value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={registroData().email}
                    onInput={(e) => handleInputChange('email', e.target.value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={registroData().telefono}
                    onInput={(e) => handleInputChange('telefono', e.target.value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="(000) 000-0000"
                  />
                </div>

                {/* Botones de Acción */}
                <div class="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowRegistroModal(false)}
                    class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleRegistro}
                    disabled={!validarFormulario()}
                    class={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      validarFormulario()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Confirmar Registro
                  </button>
                </div>

                {/* Nota Informativa */}
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p class="text-xs text-blue-700">
                    💡 <strong>Importante:</strong> Recibirás un código único para hacer check-in el día del evento. 
                    Guarda bien este código ya que lo necesitarás para ingresar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EventosPublicos;