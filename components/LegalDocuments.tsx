import React from 'react';

interface LegalDocumentsProps {
    type: 'privacy' | 'terms';
    onClose: () => void;
}

const LegalDocuments: React.FC<LegalDocumentsProps> = ({ type, onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="p-8 prose prose-invert max-w-none">
                    {type === 'privacy' ? (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-white">Política de Privacidad</h2>
                            <p className="text-gray-300 mb-4">Última actualización: 21/12/2025</p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Responsable del Tratamiento</h3>
                            <p className="text-gray-400">
                                <strong>Titular:</strong> Álvaro Castro Valverde<br />
                                <strong>Contacto:</strong> info@albumdeldia.app<br />
                                <strong>Actividad:</strong> Gestión de la plataforma personal y no comercial "AlbumDelDia".
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">2. Datos que Recopilamos</h3>
                            <p className="text-gray-400">
                                Para el correcto funcionamiento de la app, tratamos:
                            </p>
                            <ul className="list-disc pl-5 text-gray-400 space-y-2">
                                <li><strong>Datos de Google Auth:</strong> Correo electrónico, ID de usuario único, nombre y fotografía de perfil.</li>
                                <li><strong>Datos de perfil:</strong> Nombre de usuario (pseudónimo) elegido por usted.</li>
                                <li><strong>Datos de actividad:</strong> Álbumes guardados, valoraciones, fechas de escucha y estadísticas de uso.</li>
                                <li><strong>Datos técnicos:</strong> Dirección IP (registrada por los servidores de Firebase por seguridad).</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">3. Finalidad y Base Legal</h3>
                            <p className="text-gray-400">
                                <strong>Finalidad:</strong> Gestionar su perfil, permitirle guardar su historial musical y facilitar funciones sociales (buscador de amigos). Su nombre de usuario será visible para otros usuarios para que puedan encontrarle.
                            </p>
                            <p className="text-gray-400 mt-2">
                                <strong>Base Legal:</strong> El tratamiento se basa en su consentimiento al registrarse y marcar la casilla de aceptación, así como en la ejecución de la relación de servicio (el uso de la app).
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">4. Destinatarios y Transferencia de Datos</h3>
                            <p className="text-gray-400">
                                No vendemos ni cedemos sus datos a terceros. Sin embargo, utilizamos la infraestructura de Firebase (Google Cloud) para almacenar la información. Al ser un servicio de Google, los datos pueden alojarse en servidores fuera del Espacio Económico Europeo (EE. UU.). Esta transferencia está protegida bajo el marco del EU-US Data Privacy Framework y las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">5. Plazo de Conservación</h3>
                            <p className="text-gray-400">
                                Sus datos se conservarán mientras mantenga su cuenta activa. Si decide eliminar su cuenta (desde los ajustes de la app o contactando con nosotros), sus datos personales serán borrados de forma permanente de nuestras bases de datos activas.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">6. Sus Derechos (ARCO+)</h3>
                            <p className="text-gray-400">
                                Usted tiene derecho a acceder, rectificar y suprimir sus datos, así como a la portabilidad y limitación de su tratamiento. Para ejercerlos, escriba a info@albumdeldia.app. Si considera que no hemos atendido correctamente sus derechos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">7. Política de Cookies</h3>
                            <p className="text-gray-400">
                                Utilizamos cookies técnicas necesarias para el funcionamiento de la app (autenticación y preferencias). Además, utilizamos cookies analíticas (Google Analytics) para entender cómo se usa nuestra plataforma, pero estas solo se activarán si nos das tu consentimiento explícito a través del banner de cookies. Puedes cambiar tu preferencia borrando los datos de navegación de este sitio.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-white">Términos y Condiciones de Uso</h2>
                            <p className="text-gray-300 mb-4">Última actualización: 21/12/2025</p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">1. Aceptación de los Términos</h3>
                            <p className="text-gray-400">
                                Al acceder y utilizar AlbumDelDia, usted acepta estar sujeto a estos Términos y Condiciones de Uso. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">2. Uso del Servicio y Edad Mínima</h3>
                            <p className="text-gray-400">
                                AlbumDelDia es una aplicación para descubrir y realizar seguimiento de álbumes musicales. Para ser usuario de este servicio, debes tener al menos 14 años, que es la edad mínima legal en España para el consentimiento en servicios de la sociedad de la información. El uso del servicio debe ser legal y acorde a estos términos.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">3. Cuentas de Usuario</h3>
                            <ul className="list-disc pl-5 text-gray-400 space-y-2">
                                <li><strong>Registro:</strong> El acceso se realiza mediante autenticación de terceros (Google). Usted es responsable de la seguridad de su sesión.</li>
                                <li><strong>Nombre de usuario:</strong> Debe elegir un nombre de usuario que no sea ofensivo, vulgar ni infrinja derechos de propiedad intelectual de terceros.</li>
                                <li><strong>Moderación:</strong> Nos reservamos el derecho de eliminar o reclamar nombres de usuario, o suspender cuentas que incumplan estas normas o perjudiquen la convivencia en la plataforma.</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">4. Propiedad Intelectual</h3>
                            <ul className="list-disc pl-5 text-gray-400 space-y-2">
                                <li><strong>Contenido de la App:</strong> El diseño, código y logos de AlbumDelDia son propiedad del titular.</li>
                                <li><strong>Contenido de Terceros:</strong> Las portadas de álbumes, nombres de artistas y metadatos musicales son propiedad de sus respectivos titulares de derechos. Se utilizan con fines informativos, bajo el derecho de cita o a través de las APIs de plataformas de streaming vinculadas.</li>
                            </ul>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">5. Limitación de Responsabilidad</h3>
                            <p className="text-gray-400">
                                El servicio se proporciona "tal cual". AlbumDelDia no garantiza que el servicio sea ininterrumpido, libre de errores o que el contenido de terceros (metadatos de música) sea exacto en todo momento.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-white">6. Legislación Aplicable y Jurisdicción</h3>
                            <p className="text-gray-400">
                                Estos términos se rigen por la ley española. Para cualquier controversia, el usuario y el titular se someten a los Juzgados y Tribunales de la ciudad de Salamanca salvo que la ley de consumidores y usuarios establezca lo contrario.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalDocuments;
