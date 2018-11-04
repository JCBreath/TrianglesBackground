var canvas = document.getElementById("background");

var screen_width = window.screen.width;
var screen_height = window.screen.height;

canvas.width = screen_width;
canvas.height = screen_height;

var color1 = [0.35, 0.55, 1.0];
var color2 = [0.65, 0.35, 1.0];

// Light Settings
var light_z = 150;
var light_position = [500, 500, light_z];
var light_diffuse = [1.0, 1.0, 1.0, 1.0];
var k_diffuse = 1.0;
var material_diffuse = [0.35, 0.55, 1.0, 1.0];
var specular = {
	light_specular : [1.0, 1.0, 1.0, 1.0],
	light_intensity : 1.0
}
var light_attenuation = 0.618;

// Dynamic Disabled
var dynamic = false;

var framerate = 24;
var maxfps = 60;

// Define Points
var x = [];
var y = [];
var z = [];

// Define Triangles and their properties
var tri_json = [];
var triangles = [];
var normals = [];
var centers = [];
var colors = [];

var max_z = 50;

var row = 8;
var col = 16;

colorset = ['#bad7e9','#def3f8','#edf1f2','#98d5f2'];

if(localStorage.getItem("settings"))
	loadsettings();
else
	var autosave_timer = setInterval("autosave()", 1000);

generatePoints(row, col);
updateTriangles();

if(!dynamic) {
	for(var i=0;i<triangles.length;i++) {
		normals.push(CalcNormal(triangles[i]));
		centers.push(CalcCenter(triangles[i]));
		colors.push(assignColor(centers[i]));
		tri_json.push({id:i,z_index:CalcCenter(triangles[i])[2]});
	}
	//console.log(tri_json);
	tri_json.sort(function (a, b) {
		return a.z_index - b.z_index;
	});
	//console.log(tri_json);
	//console.log(Object.keys(tri_json).sort());
	
}

if(canvas.getContext){
	var context = canvas.getContext("2d");
	//context.translate(0,-50);
}

function updateTriangles() {
	triangles = [];
	for(var i=0;i<row;i++) {
		if(i%2 == 0) {
			for(var j=0;j<col+1;j++) {
				{
					addTriangle(x[i][j], y[i][j], z[i][j], x[i][j+1], y[i][j+1], z[i][j+1], x[i+1][j+1], y[i+1][j+1], z[i+1][j+1]);
					addTriangle(x[i][j], y[i][j], z[i][j], x[i+1][j], y[i+1][j], z[i+1][j], x[i+1][j+1], y[i+1][j+1], z[i+1][j+1]);
				}
			}
		}
		else {
			for(var j=0;j<col+1;j++) {
				{
					addTriangle(x[i][j], y[i][j], z[i][j], x[i][j+1], y[i][j+1], z[i][j+1], x[i+1][j], y[i+1][j], z[i+1][j]);
					addTriangle(x[i][j+1], y[i][j+1], z[i][j+1], x[i+1][j], y[i+1][j], z[i+1][j], x[i+1][j+1], y[i+1][j+1], z[i+1][j+1]);
				}
			}
		}
	}
}

function draw() {
	if(dynamic) {
		normals = [];
		centers = [];
		colors = [];
	}
	/*
	for(var i=0;i<triangles.length;i++) {
		if(dynamic) {
			normals.push(CalcNormal(triangles[i]));
			centers.push(CalcCenter(triangles[i]));
			colors.push(assignColor(centers[i]));
		}
		var I = CalcLight(i);
		var r = I*colors[i][0];
		var g = I*colors[i][1];
		var b = I*colors[i][2];

		DrawTriangle(context, triangles[i], convertColor(r, g, b), 'fill');
	}
	*/

	// Switched to sorted rendering
	for(var i=0;i<triangles.length;i++) {
		var tri_index = tri_json[i].id;
		var I = CalcLight(tri_index);
		var r = I*colors[tri_index][0];
		var g = I*colors[tri_index][1];
		var b = I*colors[tri_index][2];

		DrawTriangle(context, triangles[tri_index], convertColor(r, g, b), 'fill');
	}
}

function reassignColor() {
	colors = [];
	for(var i=0;i<triangles.length;i++)
		colors.push(assignColor(centers[i]));
}

function addTriangle(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
	triangles.push([x1, y1, z1, x2, y2, z2, x3, y3, z3]);
}

function modifyTriangle(i, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
	triangles.push([x1, y1, z1, x2, y2, z2, x3, y3, z3]);
}

// Canvas draw function
function DrawTriangle(context, triangle, color, type) {
    context.beginPath();
    context.moveTo(triangle[0], triangle[1]); // set start pt (2D)
    context.lineTo(triangle[3], triangle[4]); // draw a line to
    context.lineTo(triangle[6], triangle[7]); // continue drawing
    context.strokeStyle = color; // outline color
    context.stroke();
    context[type + 'Style'] = color; // fill color
    context.closePath();
    context[type]();
}

function CalcNormal(t) {
	var x1 = t[3] - t[0];
	var y1 = t[4] - t[1];
	var z1 = t[5] - t[2];

	var x2 = t[6] - t[0];
	var y2 = t[7] - t[1];
	var z2 = t[8] - t[2];

	var v = CrossProduct(x1, y1, z1, x2, y2, z2);

	if(v[2] < 0) {
		v[0] = -v[0];
		v[1] = -v[1];
		v[2] = -v[2];
	}

	return v;
}

function CalcCos(i) {
	t = triangles[i];
	c = centers[i];
	v1 = [light_position[0]-c[0],light_position[1]-c[1],light_position[2]-c[2]];
	v2 = normals[i];
	d_p = DotProduct(v1, v2);
	v1_len = VecLen(v1);
	v2_len = VecLen(v2);
	cos = d_p / v1_len / v2_len;
	
	return cos;
}

function DotProduct(v1, v2) {
	return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function VecLen(v) {
	return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
}

function CalcLight(i) {
	var c = centers[i];
	var d_x = light_position[0] - c[0];
	var d_y = light_position[1] - c[1];
	var d_z = light_position[2] - c[2];
	var light_src_dist = Math.sqrt(d_x*d_x+d_y*d_y+d_y*d_y);
	//console.log(light_src_dist);
	var dist_factor = (screen_width * 0.618) / light_src_dist;
	
	if(dist_factor > 1)
		dist_factor = 1;
	var I = k_diffuse * (0.5 * CalcCos(i) + 0.5) * dist_factor;
	return I;
}

function CalcAmbient() {

}

function CalcDiffuse() {

}

function CalcSpecular() {

}

function CrossProduct(x1, y1, z1, x2, y2, z2) {
	var x3 = x1 * z2 - y2 * z1;
	var y3 = x2 * z1 - x1 * z2;
	var z3 = x1 * y2 - x2 * y1;

	var len = Math.sqrt(x3 * x3 + y3 * y3 + z3 * z3);

	x3 = x3 / len;
	y3 = y3 / len;
	z3 = z3 / len;

	return [x3, y3, z3];
}

function CalcCenter(t) {
	var c_x = (t[0] + t[3] + t[6]) / 3;
	var c_y = (t[1] + t[4] + t[7]) / 3;
	var c_z = (t[2] + t[5] + t[8]) / 3;
	
	return [c_x, c_y, c_z];
}

function randomColor() {
	var r, g, b;
	var blue = Math.round(Math.random() * 26) + 230;
	r = Math.round(blue * 0.7).toString(16);
	g = Math.round(blue * 0.95).toString(16);
	b = (blue).toString(16);
	if(r.length == 1)
		r = '0' + r;
	if(g.length == 1)
		g = '0' + g;
	if(b.length == 1)
		b = '0' + b;
	//console.log('#' + r + g + b);
	return '#' + r + g + b;
	//return colorset[Math.round(Math.random() * 3)];
}

function assignColor(center) {
	var z = center[2];
	//var color = [material_diffuse[0]*z/max_z, material_diffuse[1]*z/max_z, material_diffuse[2]*z/max_z];
	//var color = material_diffuse;
	var color = CalcTopRadColor(center, color1, color2);
	return color;
}

function CalcTopRadColor(center, color1, color2) {
	var x = center[0];
	var r = color1[0] + (color2[0] - color1[0]) * x / screen_width;
	var g = color1[1] + (color2[1] - color1[1]) * x / screen_width;
	var b = color1[2] + (color2[2] - color1[2]) * x / screen_width;

	return [r, g, b];
}

function convertColor(r, g, b) {
	r = Math.round(r * 255).toString(16);
	g = Math.round(g * 255).toString(16);
	b = Math.round(b * 255).toString(16);

	if(r.length == 1)
		r = '0' + r;
	if(g.length == 1)
		g = '0' + g;
	if(b.length == 1)
		b = '0' + b;

	return '#' + r + g + b;
}

function generatePoints(row, col) {
	// row + 1 for bottom edge points
	for(var i=0;i<row+1;i++) {
		var x_temp = [];
		var y_temp = [];
		var z_temp = [];
		for(var j=0;j<col+2;j++) {
			var pt_x = screen_width / col * j;
			var pt_y = screen_height / row * i;
			var pt_z = Math.round(Math.random() * max_z);
			
			var x_odd_row_offset = screen_width / col / 2;

			if(i % 2 != 0)
				pt_x -= x_odd_row_offset;
			
			var x_random = Math.round(Math.random() * screen_width / col) - screen_width / col / 2;
			var y_random = Math.round(Math.random() * screen_height / row) - screen_height / row / 2;

			if(i != 0 && j != 0 && i != row && j != col+1) {
				pt_x += x_random;
				pt_y += y_random;
			} else if((i == 0 || i == row) && j != 0 && j != col+1) {
				pt_x += x_random;
			} else if((j == 0 || j == col+1) && i != 0 && i != row) {
				pt_y += y_random;
			}
			
			x_temp.push(pt_x);
			y_temp.push(pt_y);
			z_temp.push(pt_z);
		}
		x.push(x_temp);
		y.push(y_temp);
		z.push(z_temp);
	}
	console.log(x);
}

function movePoints() {
	for(var i=0;i<row;i++) {
		for(var j=0;j<col;j++) {
			if(i != 0 && j != 0 && i != row && j != col+1) {
				shift_x = Math.random() * 2 - 1;
				shift_y = Math.random() * 2 - 1;
				shift_z = Math.random() * 2 - 1;
				/*
				if(x[i][j] + shift_x > x[i][j+1] || x[i][j] + shift_x < x[i][j-1])
					shift_x = -shift_x;
				if(y[i][j] + shift_y > y[i-1][j] || y[i][j] + shift_y > y[i-1][j+1] || y[i][j] + shift_y < y[i+1][j] || y[i][j] + shift_y < y[i+1][j+1])
					shift_y = -shift_y;
				*/
				x[i][j] += shift_x;
				y[i][j] += shift_y;
				z[i][j] += shift_z;
			}
		}
	}
}

function drawBackground() {

}

var timer = setInterval("render()", 1000 / framerate);

function render() {
	draw();
	//movePoints();
}

function loadsettings() {
	var settings = JSON.parse(localStorage.getItem("settings"));
	// if not saved, use default
	if(settings.color1)
		color1 = JSON.parse(settings.color1);
	if(settings.color2)
		color2 = JSON.parse(settings.color2);
	if(settings.framerate)
		framerate = settings.framerate;
	if(settings.light_z) {
		light_z = settings.light_z;
		light_position = [500, 500, light_z];
	}
	var autosave_timer = setInterval("autosave()", 1000);
}

function autosave() {
	var settings = {};
	settings.color1 = JSON.stringify(color1);
	settings.color2 = JSON.stringify(color2);
	settings.framerate = framerate;
	settings.light_z = light_z;
	localStorage.setItem("settings", JSON.stringify(settings));
	console.log(localStorage.getItem("settings"));
}