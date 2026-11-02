-- =====================================================================
-- creandoproyectos · cursos de muestra
-- Curso 1 (Decoración de tortas): datos reales dados por el cliente. Falta subir el flyer desde el panel.
-- Cursos 2 a 4: EJEMPLOS DEMOSTRATIVOS (es_demo = true). No son propuestas reales.
-- Se pueden editar o eliminar desde el panel del profesor.
-- Es seguro ejecutarlo más de una vez (no duplica).
-- =====================================================================
insert into public.cursos (
  id, categoria_id, nombre, descripcion_breve, descripcion_completa, duracion, modalidad, inicio, horarios, ubicacion,
  etapas, certificaciones, ofrece_certificado, salidas_descripcion, salidas_ambitos, salidas_actividades,
  matricula, cuota_mensual, medios_pago, info_adicional, whatsapp, estado, es_demo
) values
(
  '5a1c0001-0000-4000-8000-000000000001',
  (select id from public.categorias where nombre = 'Oficios'),
  'Decoración de tortas',
  'Curso presencial de 3 meses para aprender a decorar tortas. Se cursa una vez por semana y se entrega certificación.',
  'Curso presencial de decoración de tortas de 3 meses de duración, dictado en General Rodríguez. Se cursa una vez por semana, los viernes o los sábados según el horario que te quede mejor. Al finalizar se entrega una certificación.',
  '3 meses', 'presencial', 'Marzo de 2027',
  'Viernes de 9 a 11 hs o sábados de 14 a 16 hs',
  'Independencia 1076, General Rodríguez',
  '[]'::jsonb,
  '[{"nombre":"Certificado de Decoración de Tortas","anio":"","entidad":"A.C. y Escuela Integral Creando Proyectos"}]'::jsonb,
  true, null, '{}', '{}',
  10000, 40000, null, null,
  '11 3464-9614 / 11 3040-1087', 'publicado', false
),
(
  '5a1c0002-0000-4000-8000-000000000002',
  (select id from public.categorias where nombre = 'Salud y bienestar'),
  'Psicología social',
  'Formación de 3 años con cuarto año opcional de especialización. Modalidad presencial y virtual.',
  'Formación en psicología social pensada para trabajar con personas y grupos. Se cursa en tres años, con certificaciones intermedias, y existe un cuarto año opcional de especialización. Podés cursarla de forma presencial o virtual.',
  '3 años (4.º año opcional de especialización)', 'hibrida', null, null, null,
  '[{"titulo":"Primer año","detalle":"Formación inicial."},
    {"titulo":"Segundo año","detalle":"Se obtiene el certificado de Observador Profesional."},
    {"titulo":"Tercer año","detalle":"Se obtienen las certificaciones de Operador Sociocomunitario y Operador en Psicología Social."},
    {"titulo":"Cuarto año (opcional)","detalle":"Especialización."}]'::jsonb,
  '[{"nombre":"Observador Profesional","anio":"Segundo año","entidad":""},
    {"nombre":"Operador Sociocomunitario","anio":"Tercer año","entidad":""},
    {"nombre":"Operador en Psicología Social","anio":"Tercer año","entidad":""}]'::jsonb,
  true,
  'Una formación que permite trabajar con personas y grupos en distintos ámbitos.',
  array['Consultorías','Coordinación de grupos','Trabajo comunitario','Familias','Espacios de recuperación de adicciones','Recursos humanos'],
  '{}',
  12000, 35000, 'Ejemplo: efectivo y transferencia bancaria.', 'Contenido demostrativo: los valores y datos son ilustrativos.',
  null, 'publicado', true
),
(
  '5a1c0003-0000-4000-8000-000000000003',
  (select id from public.categorias where nombre = 'Arte y diseño'),
  'Diseño gráfico',
  'Aprendé los fundamentos del diseño y a crear piezas visuales para redes, marcas y emprendimientos.',
  'Formación inicial en diseño gráfico: composición, color y tipografía, herramientas digitales de edición y creación de identidad visual. Se trabaja con proyectos prácticos y se cierra con una carpeta de trabajos.',
  '8 meses', 'virtual', null, null, null,
  '[{"titulo":"Fundamentos del diseño","detalle":"Composición, color y tipografía."},
    {"titulo":"Herramientas digitales","detalle":"Edición de imágenes y dibujo vectorial."},
    {"titulo":"Identidad visual","detalle":"Logotipos, paletas y piezas para una marca."},
    {"titulo":"Proyecto final","detalle":"Armado de una carpeta con los trabajos realizados."}]'::jsonb,
  '[]'::jsonb, false,
  'Con esta formación podés ofrecer servicios de diseño o sumarte a equipos de comunicación.',
  array['Estudios y agencias de diseño','Trabajo independiente (freelance)','Emprendimientos propios','Comunicación en redes sociales'],
  array['Diseño de logotipos','Piezas para redes sociales','Flyers y folletería','Diseño de packaging'],
  8000, 30000, 'Ejemplo: efectivo y transferencia bancaria.', 'Contenido demostrativo: los valores y datos son ilustrativos.',
  null, 'publicado', true
),
(
  '5a1c0004-0000-4000-8000-000000000004',
  (select id from public.categorias where nombre = 'Tecnología'),
  'Informática y herramientas digitales',
  'Aprendé a usar la computadora, internet y las herramientas digitales más usadas en el trabajo y la vida diaria.',
  'Curso de informática para quienes quieren moverse con soltura en la computadora: manejo del sistema, internet, correo, documentos, planillas y presentaciones, y trabajo colaborativo en la nube.',
  '6 meses', 'hibrida', null, null, null,
  '[{"titulo":"Primeros pasos","detalle":"La computadora, el sistema y la organización de archivos."},
    {"titulo":"Internet y comunicación","detalle":"Navegación segura, correo y videollamadas."},
    {"titulo":"Documentos y planillas","detalle":"Procesador de texto y hojas de cálculo."},
    {"titulo":"Presentaciones y trabajo en la nube","detalle":"Presentaciones y herramientas colaborativas."}]'::jsonb,
  '[]'::jsonb, false,
  'Las herramientas digitales se piden en casi cualquier puesto administrativo o de atención.',
  array['Tareas administrativas','Atención al público','Emprendimientos','Teletrabajo'],
  array['Armado de documentos y planillas','Carga y orden de datos','Presentaciones'],
  6000, 25000, 'Ejemplo: efectivo y transferencia bancaria.', 'Contenido demostrativo: los valores y datos son ilustrativos.',
  null, 'publicado', true
)
on conflict (id) do nothing;
