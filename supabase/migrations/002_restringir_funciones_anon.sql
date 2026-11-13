revoke execute on function
  public.is_admin(),
  public.is_member(uuid),
  public.can_manage_institucion(uuid),
  public.can_manage_storage_path(text)
from anon, public;
grant execute on function
  public.is_admin(),
  public.is_member(uuid),
  public.can_manage_institucion(uuid),
  public.can_manage_storage_path(text)
to authenticated;
