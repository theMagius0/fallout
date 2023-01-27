export class FOHovers{
    static LIST = {}
    static async loadList(){
        const listLocation = await game.settings.get('fallout', 'hoversJsonLocation')
        const jsonFile = await fetch(listLocation)
        const content = await jsonFile.json();
        FOHovers.LIST = content;  
    }  
}

// INITIALIZE SETTINGS in settings.js
// allow a path to hovers.json to be changed


// Load JSON List
Hooks.on('ready', async () => {
    await game.fallout.FOHovers.loadList();
});

Hooks.on('renderActorSheet', (app, html, options) => {
    html.find('.hover').each(function(i){
        const title = game.fallout.FOHovers.LIST[$(this).data('key')]
        $(this).prop('title', title)
    })
});

Hooks.on('renderItemSheet', (app, html, options) => {
    html.find('.hover').each(function(i){
        const title = game.fallout.FOHovers.LIST[$(this).data('key')]
        $(this).prop('title', title)
    })
});

export function outOfAmmo(actorID = null, weapon = null, numDiceRolled = 1, addingRounds = false) {
	let retVal = false;
	let ammoBefore = 0;
	let ammoAfter = 0;
	let dialogText = null;
	let additionalAmmo = 0;
	
	const myDialogOptions = {
	    height: 225
	};
	
	if (actorID && weapon) {
		let weaponID = weapon._id;
		let actorObj = game.actors.get(actorID);
		let weaponObj = actorObj.items.get(weaponID);
		
		if (actorObj && weaponObj) {

			if (actorObj.prototypeToken.actorLink) {
				let ammoType = weaponObj.system.ammo;
				let weaponName = weaponObj.name;

				// If user pressed the "add" button, they've already spent a round on the original roll.  Anything here is extra 1-1.
				// Else, user is (potentially) increasing rounds spent on the original roll, or just rolling the defualt (1) round.
				if (addingRounds) {
					additionalAmmo = numDiceRolled;
				} else {
					additionalAmmo = 1 + (numDiceRolled - weaponObj.system.damage.rating);
				}
	
				if (ammoType) {
					let ammoObj = actorObj.items.getName(ammoType);

					if (ammoObj) {
						ammoBefore = ammoObj.system.quantity;
						ammoAfter = ammoBefore - additionalAmmo;
						if (ammoAfter >= 0) {
							ammoObj.update({ 'data.quantity': ammoAfter });
						} else {
							dialogText = "Your " + weaponName + " does not have enough " + ammoType + ".";
							retVal = true;
						}
					} else {
						retVal = true;
						dialogText = "You're not carrying any " + ammoType + " for your " + weaponName + ".";
					}
				}
			}
		}
	}
		
	const html = '<section class="grid grid-2col">\
					<div class="left-column">\
					  <img src="systems/fallout/assets/ui/vault-boy-facepalm.png"</img>\
					</div>\
					<div class="right-column">\
 					  <h3>' + dialogText + '</h3>\
					</div>\
				  </section>';

	if (retVal) {
		new Dialog({
		  title: "Out of Ammo!",
		  content: html,
		  buttons: {}
		}, myDialogOptions).render(true);
	}
	
	return retVal;
}