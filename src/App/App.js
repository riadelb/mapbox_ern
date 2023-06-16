//importer la config de mapbox
import config from '../../app.config.json';
// importer le fichier css
import '../assets/style.css';
// importer la librairie mapboxgl
import mapboxgl from 'mapbox-gl';
// importer style de bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// importer le style de mapbox
import 'mapbox-gl/dist/mapbox-gl.css';
//import font-awesome 
import '@fortawesome/fontawesome-free/css/all.min.css';

//class App
class App {
    //Constructeur de la class App
    constructor() {
        this.elDivBody = null;
        this.elDivMap = null;
        this.elForm = null;
        this.elLat = null;
        this.elLng = null;
        //instantiation de la carte
        this.map = null;
        //tableau des événements
        this.events = [];
    }
    //methode qui start 
    start() {
        console.log('App démarrée...');
        this.loadDom();
        this.initMap();
        this.setupForm();
        this.readStorageEvents();
        this.addUpdate();
    }
    //methode pour initialiser la carte
    initMap() {
        // recupere l'élément du dom pour afficher la carte
        this.elDivMap = document.getElementById('map');
        //api key
        mapboxgl.accessToken = config.apis.mapbox_gl.api_key;
        //creation d'une nouvelle instance de la carte
        this.map = new mapboxgl.Map({
            container: this.elDivMap,
            style: config.apis.mapbox_gl.map_styles.dark,
            center: [0, 0],
            zoom: 1
        });
        //ajoute les boutons zoom
        const nav = new mapboxgl.NavigationControl();
        this.map.addControl(nav, 'top-left');
        const zoomControls = document.querySelector('.mapboxgl-ctrl-group');
        const updateButton = document.getElementById('update');
        zoomControls.appendChild(updateButton);
        //ecouteur click sur la carte
        this.map.on('click', (evt) => this.handleClickMap(evt));
    }
    //chargement du dom
    loadDom() {
        const addEv = document.createElement('h1');
        addEv.className = 'add-event';
        addEv.textContent = 'Ajouter un événement';

        //***************BODY******************** */
        this.elDivBody = document.createElement('div');
        this.elDivBody.id = 'body';

        //***************MAP******************** */
        this.elDivMap = document.createElement('div');
        this.elDivMap.id = 'map';

        const elMapContainer = document.createElement('div');
        elMapContainer.id = 'map-container';
        elMapContainer.appendChild(this.elDivMap);

        //***************FORM******************** */
        this.elForm = document.createElement('form');
        this.elForm.id = 'form';

        //***************TITLE******************** */
        const elTitleDiv = document.createElement('div');
        const elTitle = document.createElement('input');
        elTitle.type = 'text';
        elTitle.id = 'title';
        elTitle.placeholder = 'Titre';
        elTitleDiv.appendChild(elTitle);

        // ***************DESCRIPTION******************** */
        const elTextAreaDiv = document.createElement('div');
        const elTextArea = document.createElement('textarea');
        elTextArea.placeholder = 'Description';
        elTextArea.id = 'textArea';
        elTextAreaDiv.appendChild(elTextArea);

        //****************DATES*************** */
        const startDateDiv = document.createElement('div');
        const startDate = document.createElement('input');
        startDate.type = 'date';
        startDate.id = 'startDate';
        startDate.placeholder = 'Date de début';
        startDateDiv.appendChild(startDate);

        const endDateDiv = document.createElement('div');
        const endDate = document.createElement('input');
        endDate.type = 'date';
        endDate.id = 'endDate';
        endDate.placeholder = 'Date de fin';
        endDateDiv.appendChild(endDate);

        //***************Coordonnées***************
        const elLatDiv = document.createElement('div');
        this.elLat = document.createElement('input');
        this.elLat.type = 'float';
        this.elLat.id = 'lat';
        this.elLat.placeholder = 'Latitude';
        elLatDiv.appendChild(this.elLat);

        const elLngDiv = document.createElement('div');
        this.elLng = document.createElement('input');
        this.elLng.type = 'float';
        this.elLng.id = 'lng';
        this.elLng.placeholder = 'Longitude';
        elLngDiv.appendChild(this.elLng);

        //***************Submit Button***************
        const submitButton = document.createElement('button');
        submitButton.classList.add('btn', 'btn-primary');
        submitButton.type = 'submit';
        submitButton.textContent = 'Ajouter';
        //****************DIV DU BOUTON*************** */
        const submitButtonContainer = document.createElement('div');
        submitButtonContainer.id = 'submit';
        submitButtonContainer.append(submitButton);
        //append dans le formulaire
        this.elForm.append(elTitleDiv, elTextAreaDiv, startDateDiv, endDateDiv, elLatDiv, elLngDiv, submitButtonContainer);
        //append le h1 et le formulaire dans la div
        const elFormContainer = document.createElement('div');
        elFormContainer.id = 'form-container';
        elFormContainer.append(addEv, this.elForm);
        //bouton recharge
        const update = document.createElement('button');
        update.id = 'update';
        update.classList.add('update');
        update.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
        update.type = 'button';

        //append la carte, le formulaire et btn recharge
        this.elDivBody.append(elMapContainer, elFormContainer, update);
        document.body.append(this.elDivBody);

    }

    //gerer le click sur la carte
    handleClickMap(e) {
        //recupere les coordonnees du click
        const { lng, lat } = e.lngLat;
        console.log('Coordonnées :', lng, lat);
        //met les coordonnes dans les input
        this.elLat.value = parseFloat(lat.toFixed(6));
        this.elLng.value = parseFloat(lng.toFixed(6));
    }

    //configuration du formulaire
    setupForm() {

        this.map.on('click', this.handleClickMap.bind(this));
        this.elForm = document.getElementById('form');
        //ecouteur a l'envoie du form
        this.elForm.addEventListener('submit', this.createEvent.bind(this));
        this.elLat = document.getElementById('lat');
        this.elLng = document.getElementById('lng');
    }

    // creation d'un evenement
    createEvent(evt) {
        if (!evt || typeof evt.preventDefault !== 'function') {
            return;
        }
        //sert a ne pas recharger la page
        evt.preventDefault();
        //recuperation des valeurs
        const title = document.getElementById('title').value;
        const description = document.getElementById('textArea').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const latitude = parseFloat(document.getElementById('lat').value);
        const longitude = parseFloat(document.getElementById('lng').value);
        const markerColor = this.markerColor(startDate);

        // Création du marqueur avec une popup contenant le titre
        const marker = new mapboxgl.Marker({ color: markerColor })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup())
            .addTo(this.map);

        // Variable pour suivre l'état du survol
        let isHovered = false;
        //objet ou on stock les valeurs
        const save = {
            title,
            description,
            startDate,
            endDate,
            coordonnes: { longitude, latitude }
        }
        //reinitialisation du form
        this.elForm.reset();
        //pousser l'objet save dans le tableau
        this.events.push(save);
        //enregistre dans le localstorage
        this.saveEvent();
        //ajout du marker sur la carte
        this.addMarker(save);
        //break
        return false;
    }

    // Couleur du marqueur
    markerColor(startDate) {
        //recupere la date actuel
        const currentDate = new Date();
        //convertir la date de debut en objet Date
        const eventDate = new Date(startDate);
        //ecart entre date de debut et date de aujord'hui
        const diffDays = Math.floor((eventDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
        //compare les date
        if (diffDays < 0) {
            return 'red';
        } else if (diffDays <= 3) {
            return 'orange';
        } else {
            return 'green';
        }
    }

    addMarker(event) {
        const { title, description, startDate, endDate, coordonnes } = event;
        const { longitude, latitude } = coordonnes;
        const markerColor = this.markerColor(startDate);
        //creation d'un marker avec couleur 
        const marker = new mapboxgl.Marker({ color: markerColor })
            .setLngLat([longitude, latitude])
            .addTo(this.map);

        // Variable pour suivre l'état du survol
        let isHovered = false;
        // Variable pour suivre l'état de la popup
        let popupIsOpen = false;
        // Crée une popup contenant les informations de l'événement
        const popup = new mapboxgl.Popup().setHTML(`
                <h3>${title}</h3>
                <p>${description}</p>
                <p>${startDate} - ${endDate}</p>
                <button class="delete-button">Supprimer</button>`);
        //message en fonction de la date
        const message = this.getMessage(startDate);
        //popup pour marker
        marker.setPopup(popup);
        //ouverture de la popup 
        marker.getElement().addEventListener('click', () => {
            if (!popupIsOpen) {
                marker.getPopup().setHTML(`<h3>${title}</h3><p>${description}</p><p>${startDate} - ${endDate}</p>` + message);
                marker.togglePopup();
                popupIsOpen = true;
            } else {
                marker.togglePopup();
                popupIsOpen = false;
            }
        });
        //hover
        marker.getElement().addEventListener('mouseenter', () => {
            if (!isHovered && !popupIsOpen) {
                marker.getPopup().setHTML(`<h3>${title}</h3><p>${startDate} - ${endDate}</p>` + message);
                marker.togglePopup();
            }
            isHovered = true;
        });
        //hover
        marker.getElement().addEventListener('mouseleave', () => {
            if (isHovered && !popupIsOpen) {
                marker.togglePopup();
            }
            isHovered = false;
        });
    }

    //methode pour le message
    getMessage(startDate) {
        const currentDate = new Date();
        const evenDate = new Date(startDate);
        const diffDays = Math.floor((evenDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays < 0) {
            return '<span style= "color:red;">Quel dommage ! Vous avez raté cet événement !</span>';
        } else if (diffDays <= 3) {
            const diffHours = Math.floor(diffDays / (1000 * 3600) % 24);
            return `<span style= "color:red;">Attention, commence dans ${diffDays} jour(s) et ${diffHours} heures!</span>`;
        } else {
            return '';
        }
    }

    //Enregistrement dans le localstorage
    saveEvent() {
        const eventsJson = JSON.stringify(this.events);
        localStorage.setItem('events', eventsJson);
    }

    // Récupération des événements dans le localstorage
    readStorageEvents() {
        const eventsJson = localStorage.getItem('events');
        if (eventsJson) {
            const events = JSON.parse(eventsJson);
            events.forEach((event) => {
                this.addMarker(event);
            });
            this.events = events;
        }
    }

    update() {
        //effacer le localstorage
        localStorage.clear();
        // Supprimer la carte existante
        this.map.remove();

        // Réinitialiser le DOM
        this.elDivBody.remove();
        //recharger le dom
        this.loadDom();

        // Initialiser une nouvelle carte
        this.initMap();
        // Configurer le formulaire
        this.setupForm();

        // Enregistrer les modifications dans le localStorage
        this.saveEvent();
        // Lire les événements du localStorage
        this.readStorageEvents();
        //pour que le bouton remarche
        this.addUpdate();
    }

    //execute update
    addUpdate() {
        const clearButton = document.getElementById('update');
        clearButton.addEventListener('click', (evt) => {
            this.update();
        });
    }


}


const app = new App();
export default app;
