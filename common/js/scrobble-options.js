document.addEventListener("DOMContentLoaded", () => {
    const field = document.getElementById("melodica-client-token"), status = document.getElementById("melodica-token-status");
    function refresh() { status.textContent = localStorage.getItem("melodicaClientToken") ? "Connected" : "Disconnected"; }
    document.getElementById("melodica-token-save").addEventListener("click", () => {
        const value = field.value.trim();
        if (value) localStorage.setItem("melodicaClientToken", value);
        field.value = ""; refresh();
    });
    document.getElementById("melodica-token-remove").addEventListener("click", () => {
        localStorage.removeItem("melodicaClientToken"); field.value = ""; refresh();
    });
    refresh();
});
