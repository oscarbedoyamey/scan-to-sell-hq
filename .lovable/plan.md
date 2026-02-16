
# Fix: Reemplazar SDK invoke por fetch directo en PaymentSuccess

## Causa raiz

El cambio de `localStorage` a `sessionStorage` en el cliente de autenticacion introdujo una race condition: cuando Stripe redirige de vuelta a `/payment-success`, el SDK de Supabase aun no ha restaurado la sesion (necesita `getSession()` + listener + 200ms delay), pero `supabase.functions.invoke()` se ejecuta a los 500ms y envia un token de auth invalido o vacio. El backend puede manejar esto, pero el SDK del cliente interpreta la respuesta como error.

Con `localStorage`, el token estaba disponible sincrónicamente desde el momento de construccion del cliente, sin depender de la inicializacion asincrona del AuthProvider.

## Solucion

No es necesario volver a `localStorage`. Solo hay que desacoplar la verificacion del pago del estado de autenticacion.

## Cambios en `src/pages/PaymentSuccess.tsx`

1. **Reemplazar `supabase.functions.invoke()` por `fetch()` directo** usando solo el header `apikey` (sin Authorization)
2. **Eliminar imports innecesarios**: `useAuth` y `supabase` client
3. **Aumentar reintentos** de 3 a 6 con delays progresivos (1s, 2s, 3s, 4s, 5s)
4. **Agregar boton de reintento manual** en el estado de error
5. **Agregar logs detallados** para depuracion futura

### Codigo clave del cambio

```typescript
// ANTES (problematico):
const { data, error } = await supabase.functions.invoke('verify-payment', {
  body: { session_id: sessionId, purchase_id: pId },
});

// DESPUES (robusto):
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ session_id: sessionId, purchase_id: pId }),
  }
);
const data = await response.json();
```

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/PaymentSuccess.tsx` | Reemplazar SDK invoke por fetch directo, eliminar dependencia de auth, mejorar reintentos, agregar reintento manual |

## Sin cambios en backend

La funcion `verify-payment` ya maneja correctamente peticiones sin Authorization header (obtiene user_id desde la tabla purchases). Esto fue verificado manualmente con exito.
