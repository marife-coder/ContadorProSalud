let contadores = JSON.parse(localStorage.getItem("contadores")) || Array(8).fill(0);
let registros = JSON.parse(localStorage.getItem("registros")) || [];

function actualizar() {
    let total = 0;

    contadores.forEach((val, i) => {
        document.getElementById("contador-" + i).textContent = val;
        total += val;
    });

    document.getElementById("totalGeneral").textContent = total;
}


function sumar(i) {
    contadores[i]++;
    guardarContadores();
}

function restar(i) {
    if (contadores[i] > 0) {
        contadores[i]--;
        guardarContadores();
    }
}

function guardarContadores() {
    localStorage.setItem("contadores", JSON.stringify(contadores));
    actualizar();
}

const URL = "https://script.google.com/macros/s/AKfycbwONgbUzrzhbZ5VBck87crtmCaEVfbe-zFlMgjlYafacCs1jUOpIlbToZATfQ9J_u6g1g/exec";

function guardar() {
    let comprador = document.getElementById("comprador").value.trim();
    let lugar = document.getElementById("lugar").value.trim();
    let persona = document.getElementById("personaEntrega").value;

    let total = totalChuletadas();
    let registrados = registros.length;

    if (!comprador || !lugar || !persona) {
        alert("Complete todos los datos del registro");
        return;
    }

    if (registrados >= total) {
        alert("⚠️ Ya se registraron todas las chuletadas vendidas");
        return;
    }

    const data = {
        comprador,
        lugar,
        persona,
        entregado: false
    };

    fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
        if (resp.result === "ok") {

            // ✅ guardar también en local
            registros.push(data);
            localStorage.setItem("registros", JSON.stringify(registros));

            alert("✅ Registro guardado en Google Sheets");

            document.getElementById("comprador").value = "";
            document.getElementById("lugar").value = "";
            document.getElementById("personaEntrega").value = "";

            ver();
        } else {
            alert("❌ Error en Google Sheets");
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Error de conexión");
    });
}


function totalChuletadas() {
    return contadores.reduce((total, valor) => total + valor, 0);
}


function ver() {
    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    let total = totalChuletadas();
    let registrados = registros.length;

    if (registrados < total) {
        lista.innerHTML += `
            <p style="color:red; font-weight:bold;">
                Faltan ${total - registrados} registros por completar
            </p>
        `;
    }

    registros.forEach((r, i) => {
        lista.innerHTML += `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                background:#fdf8f6;
                padding:10px;
                border-radius:10px;
                margin-bottom:8px;
            ">
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox"
                        ${r.entregado ? "checked" : ""}
                        onchange="marcarEntregado(${i})">

                    <span style="${r.entregado ? 'text-decoration:line-through; color:gray;' : ''}">
                        <b>${r.comprador}</b> – ${r.lugar}
                        <br>
                        <small>Entrega: ${r.persona}</small>
                    </span>
                </div>

                <div style="display:flex; gap:6px;">
                    <button onclick="editar(${i})">✏️</button>
                    <button onclick="eliminar(${i})">🗑️</button>
                </div>
            </div>
        `;
    });
}

function eliminar(index) {
    if (!confirm("¿Seguro que desea eliminar este registro?")) return;

    registros.splice(index, 1);
    localStorage.setItem("registros", JSON.stringify(registros));
    ver();
}

function editar(index) {
    let r = registros[index];

    let nuevoComprador = prompt("Editar nombre del comprador:", r.comprador);
    if (nuevoComprador === null) return;

    let nuevoLugar = prompt("Editar lugar de entrega:", r.lugar);
    if (nuevoLugar === null) return;

    let nuevaPersona = prompt("Editar persona encargada:", r.persona);
    if (nuevaPersona === null) return;

    registros[index] = {
        ...r,
        comprador: nuevoComprador.trim(),
        lugar: nuevoLugar.trim(),
        persona: nuevaPersona.trim()
    };

    localStorage.setItem("registros", JSON.stringify(registros));
    ver();
}

function marcarEntregado(index) {
    registros[index].entregado = !registros[index].entregado;
    localStorage.setItem("registros", JSON.stringify(registros));
    ver(); // refresca la vista
}


actualizar();
