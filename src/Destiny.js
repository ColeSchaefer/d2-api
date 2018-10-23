const fetch = require('node-fetch');

class Destiny {
    constructor(key) {
        this.apiHeaders = { headers: { 'X-API-Key': key } };
        
        this.playerData = {
            Genders: ['Male', 'Female'],
            Classes: ['Titan', 'Hunter', 'Warlock'],
            Races: ['Human', 'Awoken', 'Exo']
        };
        
        this.components = [
            "Profiles",
            "Characters",
            "CharacterProgressions"
        ];
    }
    
    getCharacterData(accountName, characterIndex) {
        return new Promise((resolve, reject) => {
            // No values given
            if (!accountName) return reject(new Error('You must supply an account name'));
            if (!characterIndex) return reject(new Error('You must supply a character number'));
            
            // Invalid value type
            if (typeof accountName !== 'string') return reject(new TypeError('Account name must be a string'));
            if (typeof characterIndex !== 'string') return reject(new TypeError('Character number must be a string'));
            
            let result;
            let data;
            
            (async () => {
                try {
                    accountName = encodeURI(accountName);
                    
                    result = await fetch(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/All/${accountName}/`, this.apiHeaders);
                    data = await result.json();
                    
                    let profileData = data.Response[0];
                    let membershipId = profileData.membershipId;
                    let membershipType = profileData.membershipType;
                    let components = this.components.join(',');
                    
                    result = await fetch(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`, this.apiHeaders);
                    data = await result.json();
                    data = data.Response;
                    
                    let characterId = data.profile.data.characterIds[characterIndex];
                    
                    if (characterId) {
                        let charData = data.characters.data[characterId];
                        
                        // Convert the indexed information into human-readable data
                        charData.genderType = this.playerData.Genders[charData.genderType];
                        charData.raceType = this.playerData.Races[charData.raceType];
                        charData.classType = this.playerData.Classes[charData.classType];
                        
                        return resolve(charData);
                    } else {
                        return reject(new Error('Unable to retrieve data for supplied character ID'));
                    }
                    
                    
                } catch (err) {
                    return reject(err);
                }
            })();
        });
    }
}

module.exports = Destiny;