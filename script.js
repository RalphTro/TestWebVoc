document.addEventListener('DOMContentLoaded', function() {
    const contentElement = document.getElementById('content');

    document.getElementById('browseClasses').addEventListener('click', () => {
        window.location.hash = 'AllClasses';
        loadTerms('rdfs:Class', 'Class', 'Description');
    });
    document.getElementById('browseProperties').addEventListener('click', () => {
        window.location.hash = 'AllProperties';
        loadTerms('rdf:Property', 'Property', 'Description');
    });
    document.getElementById('browseTypeCodes').addEventListener('click', () => {
        window.location.hash = 'AllTypeCodes';
        loadTerms('gs1de:TestCodeListCode', 'Type Code', 'Description');
    });

    function loadTerms(typeFilter, headerLabel, headerDescription) {
        fetch('webvoc.jsonld')
        .then(response => response.json())
        .then(data => {
            const filteredItems = data['@graph'].filter(item => item['@type'].includes(typeFilter));
            filteredItems.sort((a, b) => a['rdfs:label']['@value'].localeCompare(b['rdfs:label']['@value']));

            contentElement.innerHTML = `
                <div class="table-header">
                    <span class="header-label">${headerLabel}</span>
                    <span class="header-description">${headerDescription}</span>
                </div>
                <ul>${filteredItems.map(item => `
                    <li>
                        <a href="#${item['@id'].split(':').pop()}" onclick="loadItemDetails('${item['@id']}')">
                            <span class="label">${item['rdfs:label']['@value']}</span>
                            <span class="description">${item['rdfs:comment']['@value']}</span>
                        </a>
                    </li>`).join('')}</ul>`;
        })
        .catch(error => {
            contentElement.innerHTML = `<p>Error loading data: ${error}</p>`;
        });
    }

    window.loadItemDetails = function(itemId) {
        window.location.hash = itemId.split(':').pop();
        fetch('webvoc.jsonld')
        .then(response => response.json())
        .then(data => {
            const item = data['@graph'].find(i => i['@id'] === itemId);
            if (item) {
                contentElement.innerHTML = `
                    <h1>${item['rdfs:label']['@value']}</h1>
                    <h2>${item['@type'].join(', ')}</h2>
                    <p>${item['rdfs:comment']['@value']}</p>
                    <p>Status: ${item['sw:term_status']}</p>
                `;
            }
        })
        .catch(error => {
            contentElement.innerHTML = `<p>Error loading item details: ${error}</p>`;
        });
    }
});
