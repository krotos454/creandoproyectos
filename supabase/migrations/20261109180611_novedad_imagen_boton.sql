alter table public.novedades
  add column if not exists imagen_url text,
  add column if not exists imagen_path text,
  add column if not exists tipo_boton text not null default 'whatsapp',
  add column if not exists telefono_whatsapp text,
  add column if not exists curso_id uuid references public.cursos(id) on delete set null;

alter table public.novedades
  add constraint novedades_tipo_boton_check check (tipo_boton in ('whatsapp', 'curso')),
  add constraint novedades_imagen_url_check check (imagen_url is null or (imagen_url ~ '^https://' and char_length(imagen_url) <= 1000)),
  add constraint novedades_imagen_path_check check (imagen_path is null or char_length(imagen_path) <= 300),
  add constraint novedades_telefono_whatsapp_check check (telefono_whatsapp is null or telefono_whatsapp ~ '^[0-9]{8,15}$');

update public.novedades
set tipo_boton = 'whatsapp',
    telefono_whatsapp = '1136052246',
    curso_id = null,
    enlace = 'https://wa.me/5491136052246?text=Hola%2C%20quiero%20consultar%20sobre%20la%20novedad.',
    texto_boton = 'Consultar por WhatsApp'
where id = 1;

notify pgrst, 'reload schema';
