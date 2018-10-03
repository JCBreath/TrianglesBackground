var canvas = document.getElementById("background");

var screen_width = window.screen.width;
var screen_height = window.screen.height;

canvas.width = screen_width;
canvas.height = screen_height;

var color1 = [0.35, 0.55, 1.0];
var color2 = [0.65, 0.35, 1.0];


// Light Settings
var light_z = 250;
var light_position = [500, 500, light_z];
var light_diffuse = [1.0, 1.0, 1.0, 1.0];
var k_diffuse = 1.0;
var material_diffuse = [0.35, 0.55, 1.0, 1.0];

var specular = {
	light_specular : [1.0, 1.0, 1.0, 1.0],
	light_intensity : 1.0
}

// Dynamic Disabled
var dynamic = false;

// Define Points
var x = [];
var y = [];
var z = [];

// Define Triangles and their properties
var triangles = [];
var normals = [];
var centers = [];
var colors = [];

max_z = 50;

row = 8;
col = 16;

colorset = ['#bad7e9','#def3f8','#edf1f2','#98d5f2'];



generatePoints(row, col);
updateTriangles();

if(!dynamic) {
	for(var i=0;i<triangles.length;i++) {
		normals.push(CalcNormal(triangles[i]));
		centers.push(CalcCenter(triangles[i]));
		colors.push(assignColor(centers[i]));
	}
}

if(canvas.getContext){
	var context = canvas.getContext("2d");
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
	for(var i=0;i<triangles.length;i++) {
		if(dynamic) {
			normals.push(CalcNormal(triangles[i]));
			centers.push(CalcCenter(triangles[i]));
			colors.push(assignColor(centers[i]));
		}
		var I = CalcLight(i);
		DrawTriangle(context, triangles[i], convertColor(I*colors[i][0], I*colors[i][1], I*colors[i][2]), 'fill');
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

function DrawTriangle(context, triangle, color, type) {
    context.beginPath();
    context.moveTo(triangle[0], triangle[1]);
    context.lineTo(triangle[3], triangle[4]);
    context.lineTo(triangle[6], triangle[7]);
    context.strokeStyle = color;
    context.stroke();
    context[type + 'Style'] = color;
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
	I = k_diffuse * (0.5 * CalcCos(i) + 0.5);
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
	var c1 = (t[0] + t[3] + t[6]) / 3;
	var c2 = (t[1] + t[4] + t[7]) / 3;
	var c3 = (t[2] + t[5] + t[8]) / 3;
	
	return [c1, c2, c3];
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

setInterval("render()", 1000 / 60);

function render() {
	
	draw();
	//movePoints();
}