function info_velib(){
    fetch("https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=100&refine=nom_arrondissement_communes%3A%22Paris%22")
    .then(response => response.text())
    .then(contents => console.log(contents));
}
info_velib();