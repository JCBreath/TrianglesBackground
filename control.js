function addHeading(content) {
	var control = document.getElementById('control');
	var heading = document.createElement('div');

	heading.className = "heading";
	heading.textContent = content;
	control.appendChild(heading);
}

function addSlider(id, type, description) {
	var control = document.getElementById('control');
	var slider = document.createElement('div');
	var slider_bar = document.createElement('div');

	// Brightness Percentage
	var brtperc = document.createElement('div');
	brtperc.className = "perc";
	brtperc.id = id + "-perc"

	var perc;

	if(id == "C1R") {
		brtperc.textContent = Math.round(color1[0] * 100) + "%";
		slider_bar.style.width = Math.round(color1[0] * 300) + "px";
	} else if(id == "C1G") {
		brtperc.textContent = Math.round(color1[1] * 100) + "%";
		slider_bar.style.width = Math.round(color1[1] * 300) + "px";
	} else if(id == "C1B") {
		brtperc.textContent = Math.round(color1[2] * 100) + "%";
		slider_bar.style.width = Math.round(color1[2] * 300) + "px";
	} else if(id == "C2R") {
		brtperc.textContent = Math.round(color2[0] * 100) + "%";
		slider_bar.style.width = Math.round(color2[0] * 300) + "px";
	} else if(id == "C2G") {
		brtperc.textContent = Math.round(color2[1] * 100) + "%";
		slider_bar.style.width = Math.round(color2[1] * 300) + "px";
	} else if(id == "C2B") {
		brtperc.textContent = Math.round(color2[2] * 100) + "%";
		slider_bar.style.width = Math.round(color2[2] * 300) + "px";
	} else if(id == "LH") {
		brtperc.textContent = Math.round(light_z - max_z) + " px";
		slider_bar.style.width = Math.round((light_z - max_z) / 500 * 300) + "px";
	} else if(id == "FR") {
		brtperc.textContent = Math.round(framerate) + " FPS";
		slider_bar.style.width = Math.round(framerate / maxfps * 300) + "px";
	}

	var desc = document.createElement('div');
	desc.className = "desc";
	desc.id = id + "-desc"
	desc.textContent = description;

	slider.className = "light-slider";
	slider.id = id;
	slider_bar.className = "light-slider-bar";
	slider_bar.id = id + "-bar";
	slider.appendChild(slider_bar);

	slider.addEventListener('mousedown', function(e){
		sliderOnTouch = this.id;
		startWidth = parseInt(slider_bar.style.width);
		startX = e.pageX;
	});

	slider.appendChild(brtperc);
	slider.appendChild(desc);
	control.appendChild(slider);
}

var mouseX, mouseY, startX, startWidth;

var sliderOnTouch = -1;

document.addEventListener('mousemove', function(e){
	light_position = [e.pageX, e.pageY, light_z];
	mouseX = e.pageX;
	mouseY = e.pageY;
	//info.textContent = e.pageX + ", " + e.pageY;
	if(sliderOnTouch != -1) {
		var slider_bar = document.getElementById(sliderOnTouch + "-bar");
		var slider_bar_width = startWidth + mouseX - startX;
		var brtperc = document.getElementById(sliderOnTouch + "-perc");
		if(slider_bar_width > 300)
			slider_bar_width = 300;
		if(slider_bar_width < 0)
			slider_bar_width = 0;
		slider_bar.style.width = slider_bar_width + 'px';
		if(sliderOnTouch == "C1R") {
			color1[0] = slider_bar_width / 300;
			brtperc.textContent = Math.round(slider_bar_width / 3) + "%";
			reassignColor();
		} else if(sliderOnTouch == "C1G") {
			color1[1] = slider_bar_width / 300;
			brtperc.textContent = Math.round(slider_bar_width / 3) + "%";
			reassignColor();
		} else if(sliderOnTouch == "C1B") {
			color1[2] = slider_bar_width / 300;
			brtperc.textContent = Math.round(slider_bar_width / 3) + "%";
			reassignColor();
		} else if(sliderOnTouch == "C2R") {
			color2[0] = slider_bar_width / 300;
			brtperc.textContent = Math.round(slider_bar_width / 3) + "%";
			reassignColor();
		} else if(sliderOnTouch == "C2G") {
			color2[1] = slider_bar_width / 300;
			brtperc.textContent = Math.round(slider_bar_width / 3) + "%";
			reassignColor();
		} else if(sliderOnTouch == "C2B") {
			color2[2] = slider_bar_width / 300;
			brtperc.textContent = Math.round(slider_bar_width / 3) + "%";
			reassignColor();
		} else if(sliderOnTouch == "LH") {
			light_z = slider_bar_width / 300 * 500 + max_z;
			light_position = [mouseX, mouseY, light_z];
			brtperc.textContent = Math.round(light_z - max_z) + " px";
		} else if(sliderOnTouch == "FR") {
			framerate = slider_bar_width / 300 * maxfps;
			clearInterval(timer);
			if(framerate != 0)
				timer = setInterval("render()", 1000 / framerate);
			brtperc.textContent = Math.round(slider_bar_width / 300 * maxfps) + " FPS";
		}
	}
});

document.addEventListener('mouseup', function(e){
	sliderOnTouch = -1;
});

addHeading("Color  1");
addSlider("C1R", "C1", "R");
addSlider("C1G", "C1", "G");
addSlider("C1B", "C1", "B");

addHeading("Color  2");
addSlider("C2R", "C2", "R");
addSlider("C2G", "C2", "G");
addSlider("C2B", "C2", "B");
/*
addHeading("Flatness");
addSlider("F", "FLT", "");
*/
addHeading("Light Source Height");
addSlider("LH", "LH", "");

addHeading("Frame Rate");
addSlider("FR", "FR", "");
/*
addHeading("Number of Triangles");
addSlider("RN", "RN", "");
addSlider("CN", "CN", "");
*/
//addHeading("Last Updated 11/04");