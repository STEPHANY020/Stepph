/* ==========================================
   UMA - MI BIBLIOTECA
   JavaScript
========================================== */

let libros = JSON.parse(localStorage.getItem("UMA_LIBROS")) || [];

let libroActual = null;
let capituloEditando = null;


/* ==========================================
   INICIO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    cargarLibros();

    document.querySelectorAll("[data-section]").forEach(btn => {

        btn.addEventListener("click", () => {

            const seccion = btn.dataset.section;

            mostrarSeccion(seccion);

        });

    });


    /* CREAR LIBRO */

    document
        .getElementById("formLibro")
        .addEventListener("submit", crearLibro);


    /* LOGO */

    document
        .getElementById("logoInput")
        .addEventListener("change", previsualizarLogo);


    /* CONTADOR */

    document
        .getElementById("editorContent")
        .addEventListener("input", actualizarContador);


    /* GUARDAR CTRL + S */

    document.addEventListener("keydown", e => {

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {

            e.preventDefault();

            if (libroActual) {
                guardarCapitulo();
            }

        }

    });

});


/* ==========================================
   NAVEGACIÓN
========================================== */

function mostrarSeccion(nombre) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    const destino = document.getElementById(nombre);

    if (destino) {
        destino.classList.add("active");
    }

    document.querySelectorAll(".nav-btn")
        .forEach(btn => {

            btn.classList.remove("active");

            if (btn.dataset.section === nombre) {
                btn.classList.add("active");
            }

        });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ==========================================
   CREAR LIBRO
========================================== */

function crearLibro(e) {

    e.preventDefault();

    const titulo = document
        .getElementById("titulo")
        .value
        .trim();

    const autor = document
        .getElementById("autor")
        .value
        .trim();

    const color = document
        .getElementById("colorPortada")
        .value;

    const frase = document
        .getElementById("frase")
        .value
        .trim();

    const sinopsis = document
        .getElementById("sinopsis")
        .value
        .trim();

    const logo = document
        .getElementById("logoPreview")
        .dataset.logo || "";


    if (!titulo || !autor) {

        mostrarNotificacion(
            "Completa el título y el autor."
        );

        return;
    }


    const nuevoLibro = {

        id: generarId(),

        titulo: titulo,

        autor: autor,

        color: color,

        frase: frase,

        sinopsis: sinopsis,

        logo: logo,

        favorito: false,

        fecha: new Date().toISOString(),

        capitulos: []

    };


    libros.push(nuevoLibro);

    guardarDatos();


    document
        .getElementById("formLibro")
        .reset();

    document
        .getElementById("logoPreview")
        .style.display = "none";

    document
        .getElementById("logoPreview")
        .dataset.logo = "";


    mostrarNotificacion(
        "¡Libro creado correctamente!"
    );


    cargarLibros();

    abrirEditor(nuevoLibro.id);

}


/* ==========================================
   ID
========================================== */

function generarId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2);

}


/* ==========================================
   GUARDAR LOCALSTORAGE
========================================== */

function guardarDatos() {

    localStorage.setItem(
        "UMA_LIBROS",
        JSON.stringify(libros)
    );

}


/* ==========================================
   CARGAR LIBROS
========================================== */

function cargarLibros() {

    renderLibros(
        document.getElementById("inicioLibros"),
        libros
    );

    renderLibros(
        document.getElementById("todosLosLibros"),
        libros
    );

    renderLibros(
        document.getElementById("librosFavoritos"),
        libros.filter(libro => libro.favorito)
    );

}


/* ==========================================
   MOSTRAR LIBROS
========================================== */

function renderLibros(contenedor, lista) {

    if (!contenedor) return;

    contenedor.innerHTML = "";


    if (lista.length === 0) {

        contenedor.innerHTML = `
            <div class="empty">
                <h3>Aún no tienes libros</h3>
                <p>Comienza creando tu primera historia.</p>
            </div>
        `;

        return;
    }


    lista.forEach(libro => {

        const card = document.createElement("div");

        card.className = "book-card";


        card.innerHTML = `

            <div
                class="book-cover"
                style="background:${libro.color}"
            >

                <button
                    class="favorite"
                    onclick="toggleFavorito('${libro.id}')"
                >
                    ${libro.favorito ? "♥" : "♡"}
                </button>

                ${
                    libro.logo
                    ?
                    `<img
                        src="${libro.logo}"
                        style="
                            max-width:100px;
                            max-height:55px;
                            object-fit:contain;
                            margin:0 auto 15px;
                        "
                    >`
                    :
                    ""
                }

                <h3>${escapar(libro.titulo)}</h3>

                <p>
                    ${escapar(libro.autor)}
                </p>

            </div>


            <div class="book-info">

                <h3>
                    ${escapar(libro.titulo)}
                </h3>

                <p>
                    ${
                        escapar(
                            libro.sinopsis ||
                            "Sinopsis pendiente..."
                        )
                    }
                </p>


                <div class="book-actions">

                    <button
                        onclick="abrirLector('${libro.id}')"
                    >
                        📖 Leer
                    </button>

                    <button
                        onclick="abrirEditor('${libro.id}')"
                    >
                        ✏️ Escribir
                    </button>

                    <button
                        onclick="eliminarLibro('${libro.id}')"
                    >
                        🗑
                    </button>

                </div>

            </div>

        `;


        contenedor.appendChild(card);

    });

}


/* ==========================================
   FAVORITO
========================================== */

function toggleFavorito(id) {

    const libro = libros.find(
        item => item.id === id
    );

    if (!libro) return;

    libro.favorito = !libro.favorito;

    guardarDatos();

    cargarLibros();

    mostrarNotificacion(
        libro.favorito
        ? "Añadido a favoritos ❤️"
        : "Eliminado de favoritos"
    );

}


/* ==========================================
   ELIMINAR LIBRO
========================================== */

function eliminarLibro(id) {

    const libro = libros.find(
        item => item.id === id
    );

    if (!libro) return;


    const confirmar = confirm(
        `¿Seguro que quieres eliminar "${libro.titulo}"?`
    );


    if (!confirmar) return;


    libros = libros.filter(
        item => item.id !== id
    );

    guardarDatos();

    cargarLibros();

    mostrarNotificacion(
        "Libro eliminado."
    );

}


/* ==========================================
   ABRIR EDITOR
========================================== */

function abrirEditor(id) {

    const libro = libros.find(
        item => item.id === id
    );

    if (!libro) return;

    libroActual = libro;

    capituloEditando = null;


    document
        .getElementById("editorBookTitle")
        .textContent = libro.titulo;


    document
        .getElementById("capituloTitulo")
        .value = "";

    document
        .getElementById("capituloFrase")
        .value = "";


    document
        .getElementById("editorContent")
        .innerHTML = `
            <p>Comienza a escribir tu historia aquí...</p>
        `;


    colocarLogoCapitulo();


    mostrarSeccion("editor");

}


/* ==========================================
   LOGO DEL CAPÍTULO
========================================== */

function colocarLogoCapitulo() {

    const contenedor =
        document.getElementById("logoChapter");


    if (!libroActual || !libroActual.logo) {

        contenedor.innerHTML = "";

        return;
    }


    contenedor.innerHTML = `
        <img
            src="${libroActual.logo}"
            alt="Logo"
        >
    `;

}


/* ==========================================
   GUARDAR CAPÍTULO
========================================== */

function guardarCapitulo() {

    if (!libroActual) return;


    const titulo = document
        .getElementById("capituloTitulo")
        .value
        .trim();

    const frase = document
        .getElementById("capituloFrase")
        .value
        .trim();

    const contenido = document
        .getElementById("editorContent")
        .innerHTML;


    if (!titulo) {

        mostrarNotificacion(
            "Escribe el título del capítulo."
        );

        return;
    }


    const capitulo = {

        id: capituloEditando || generarId(),

        titulo: titulo,

        frase: frase,

        contenido: contenido,

        fecha: new Date().toISOString()

    };


    if (capituloEditando) {

        const index =
            libroActual.capitulos.findIndex(
                c => c.id === capituloEditando
            );

        if (index !== -1) {

            libroActual.capitulos[index] =
                capitulo;

        }

    } else {

        libroActual.capitulos.push(capitulo);

    }


    guardarDatos();

    cargarLibros();


    mostrarNotificacion(
        "Capítulo guardado correctamente."
    );


    capituloEditando = capitulo.id;

}


/* ==========================================
   EDITAR CAPÍTULO
========================================== */

function editarCapitulo(id) {

    if (!libroActual) return;


    const capitulo =
        libroActual.capitulos.find(
            c => c.id === id
        );


    if (!capitulo) return;


    capituloEditando = id;


    document
        .getElementById("capituloTitulo")
        .value = capitulo.titulo;


    document
        .getElementById("capituloFrase")
        .value = capitulo.frase || "";


    document
        .getElementById("editorContent")
        .innerHTML = capitulo.contenido;


    colocarLogoCapitulo();

    mostrarSeccion("editor");

}


/* ==========================================
   EDITAR LIBRO DESDE LECTOR
========================================== */

function editarLibroActual() {

    if (!libroActual) return;

    abrirEditor(libroActual.id);

}


/* ==========================================
   LEER LIBRO
========================================== */

function abrirLector(id) {

    const libro = libros.find(
        item => item.id === id
    );

    if (!libro) return;


    libroActual = libro;


    const lector =
        document.getElementById("bookReader");


    let html = `

        <div
            class="reader-cover"
            style="background:${libro.color}"
        >

            ${
                libro.logo
                ?
                `<img src="${libro.logo}">`
                :
                ""
            }

            <h1>
                ${escapar(libro.titulo)}
            </h1>

            <p>
                ${escapar(libro.autor)}
            </p>

            ${
                libro.frase
                ?
                `<p style="
                    margin-top:25px;
                    font-style:italic;
                ">
                    “${escapar(libro.frase)}”
                </p>`
                :
                ""
            }

        </div>


        <div class="reader-chapter">

            <h2>Sinopsis</h2>

            <div class="reader-content">
                <p>
                    ${escapar(
                        libro.sinopsis ||
                        "Este libro todavía no tiene sinopsis."
                    )}
                </p>
            </div>

        </div>

    `;


    if (libro.capitulos.length === 0) {

        html += `

            <div class="reader-chapter">

                <h2>Tu historia comienza aquí</h2>

                <p class="reader-opening">
                    Todavía no has creado capítulos.
                </p>

            </div>

        `;

    }


    libro.capitulos.forEach((capitulo, index) => {

        html += `

            <div class="reader-chapter">

                ${
                    libro.logo
                    ?
                    `
                    <div style="
                        text-align:center;
                        margin-bottom:30px;
                    ">
                        <img
                            src="${libro.logo}"
                            style="
                                max-width:150px;
                                max-height:80px;
                            "
                        >
                    </div>
                    `
                    :
                    ""
                }


                <h2>
                    ${escapar(capitulo.titulo)}
                </h2>


                ${
                    capitulo.frase
                    ?
                    `
                    <div class="reader-opening">
                        “${escapar(capitulo.frase)}”
                    </div>
                    `
                    :
                    ""
                }


                <div class="reader-content">

                    ${capitulo.contenido}

                </div>


                <div style="
                    text-align:center;
                    margin-top:50px;
                    color:#999;
                    font-size:12px;
                ">
                    ${index + 1}
                </div>

            </div>

        `;

    });


    lector.innerHTML = html;

    mostrarSeccion("lector");

}


/* ==========================================
   VOLVER
========================================== */

function volverABiblioteca() {

    cargarLibros();

    mostrarSeccion("libros");

}


/* ==========================================
   WORD EDITOR
========================================== */

function ejecutar(comando) {

    document
        .getElementById("editorContent")
        .focus();

    document.execCommand(
        comando,
        false,
        null
    );

    actualizarContador();

}


/* ==========================================
   FUENTE
========================================== */

function cambiarFuente(fuente) {

    document
        .getElementById("editorContent")
        .focus();

    document.execCommand(
        "fontName",
        false,
        fuente
    );

}


/* ==========================================
   TAMAÑO
========================================== */

function cambiarTamano(tamano) {

    const editor =
        document.getElementById("editorContent");

    editor.focus();


    document.execCommand(
        "fontSize",
        false,
        "7"
    );


    const elementos =
        editor.querySelectorAll(
            'font[size="7"]'
        );


    elementos.forEach(elemento => {

        elemento.removeAttribute("size");

        elemento.style.fontSize =
            `${tamano}pt`;

    });

}


/* ==========================================
   COLOR TEXTO
========================================== */

function cambiarColor(color) {

    document
        .getElementById("editorContent")
        .focus();

    document.execCommand(
        "foreColor",
        false,
        color
    );

}


/* ==========================================
   RESALTADO
========================================== */

function resaltar(color) {

    document
        .getElementById("editorContent")
        .focus();


    document.execCommand(
        "hiliteColor",
        false,
        color
    );

}


/* ==========================================
   INTERLINEADO
========================================== */

function cambiarInterlineado(valor) {

    const editor =
        document.getElementById("editorContent");


    editor.focus();


    const seleccion =
        window.getSelection();


    if (!seleccion.rangeCount) return;


    let nodo =
        seleccion.anchorNode;


    while (
        nodo &&
        nodo !== editor &&
        nodo.nodeType !== 1
    ) {
        nodo = nodo.parentNode;
    }


    if (
        nodo &&
        nodo !== editor
    ) {

        nodo.style.lineHeight =
            valor;

    } else {

        editor.style.lineHeight =
            valor;

    }

}


/* ==========================================
   INSERTAR ENLACE
========================================== */

function insertarEnlace() {

    const url =
        prompt(
            "Escribe la URL del enlace:"
        );


    if (!url) return;


    document
        .getElementById("editorContent")
        .focus();


    document.execCommand(
        "createLink",
        false,
        url
    );

}


/* ==========================================
   INSERTAR IMAGEN
========================================== */

function insertarImagen() {

    const url =
        prompt(
            "Pega la URL de la imagen:"
        );


    if (!url) return;


    document
        .getElementById("editorContent")
        .focus();


    document.execCommand(
        "insertImage",
        false,
        url
    );

}


/* ==========================================
   LOGO PREVIEW
========================================== */

function previsualizarLogo(e) {

    const archivo =
        e.target.files[0];


    if (!archivo) return;


    if (!archivo.type.startsWith("image/")) {

        mostrarNotificacion(
            "Selecciona una imagen válida."
        );

        return;
    }


    const lector =
        new FileReader();


    lector.onload = function(event) {

        const preview =
            document.getElementById(
                "logoPreview"
            );


        preview.src =
            event.target.result;


        preview.dataset.logo =
            event.target.result;


        preview.style.display =
            "block";

    };


    lector.readAsDataURL(archivo);

}


/* ==========================================
   CONTADOR DE PALABRAS
========================================== */

function actualizarContador() {

    const texto =
        document
            .getElementById("editorContent")
            .innerText
            .trim();


    if (!texto) {

        document
            .getElementById("wordCount")
            .textContent =
            "0 palabras";

        return;
    }


    const palabras =
        texto
            .split(/\s+/)
            .filter(Boolean)
            .length;


    document
        .getElementById("wordCount")
        .textContent =
        `${palabras} palabras`;

}


/* ==========================================
   COMPARTIR
========================================== */

async function compartirLibro() {

    if (!libroActual) return;


    const texto =
        `Estoy leyendo "${libroActual.titulo}" en mi biblioteca UMA.`;


    if (navigator.share) {

        try {

            await navigator.share({

                title: libroActual.titulo,

                text: texto

            });

        } catch (error) {

            console.log(error);

        }

    } else {

        try {

            await navigator.clipboard.writeText(
                texto
            );

            mostrarNotificacion(
                "Texto copiado para compartir."
            );

        } catch {

            mostrarNotificacion(
                "No se pudo copiar."
            );

        }

    }

}


/* ==========================================
   PDF
========================================== */

function descargarPDF() {

    if (!libroActual) return;


    mostrarNotificacion(
        "Abriendo impresión para guardar como PDF..."
    );


    setTimeout(() => {

        window.print();

    }, 700);

}


/* ==========================================
   ESCAPAR HTML
========================================== */

function escapar(texto) {

    if (!texto) return "";

    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================
   NOTIFICACIONES
========================================== */

function mostrarNotificacion(mensaje) {

    const elemento =
        document.getElementById(
            "notification"
        );


    elemento.textContent =
        mensaje;


    elemento.classList.add(
        "show"
    );


    setTimeout(() => {

        elemento.classList.remove(
            "show"
        );

    }, 2500);

}