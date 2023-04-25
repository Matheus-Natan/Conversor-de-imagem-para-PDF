const form = document.querySelector('form');

function getDownload() {

    fetch('/api/download')
        .then(response => {
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            let img1 = document.getElementById("img").value;
            a.download = img1.substring(0, img1.length - 4) + '.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error(error);
        });

}

function checkFiles(file) {

    let fileValue = file.value;

    var ext = fileValue.substring(fileValue.lastIndexOf('.') + 1);

    if (fileValue != "") {
        if (ext == "jpeg" || ext == "png") {
            return true;
        }
        else {
            return false,
                alert("Insira um Arquivo no Formato PNG ou JPEG"),
                window.location.reload()
        }
    } else {
        return false,
            alert("Anexe uma Imagem!")
    }

}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    let img = document.getElementById("img");

    if (checkFiles(img) === true) {
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.message == "Imagem Convertida") {
                    getDownload();
                }
            })
            .catch(error => {
                console.error(error);
            })
    }
});