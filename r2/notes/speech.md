#Speech
How will we implement dynamic and situation specific dialog to give a player the most agency possible?

##Categories of Speech
* Game State
* Circumstance
* Special

####Game State
This is the most basic speech a NPC has.  There will be a required *default* interaction for every entity that provides a speech interaction.

The remainder will be speech is dictated by what state the game is in, as in the Player has defeated the third Boss or the Player has not aquired a sword yet.

####Circumstance
Sometimes Game State speech is boring and ruins emersion.  When a player is wearing a silly mask, or has just punched an NPC,  certain responses should take precedent.  

These interations are triggered when a certain condition is met (like the player wearing a mask) or when matching a specified Game State and also meeting the condition.

####Special
This is when the normal bounds of interations need to be changed.  This is for "cut scenes" and set pieces in general.

##How does an interaction work?

