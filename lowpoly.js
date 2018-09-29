var drawing = document.getElementById("background");

var light_position = [500, 500, 500];
var light_diffuse = [1.0, 1.0, 1.0, 1.0];
var k_diffuse = 0.9;
var material_diffuse = [0.5, 0.8, 1.0, 1.0];

C = [light_diffuse[0] * material_diffuse[0], light_diffuse[1] * material_diffuse[1], light_diffuse[2] * material_diffuse[2]];

// Define points
var x = [];
var y = [];
var z = [];

var triangles = [];
var normals = [];
var centers = [];

ptNum = 100;
row = 12;
col = 6;

colorset = ['#bad7e9','#def3f8','#edf1f2','#98d5f2'];

generatePoints(row, col);

if(drawing.getContext){
	var context = drawing.getContext("2d");
	for(var i=0;i<col-1;i++) {
		for(var j=0;j<row-1;j++) {
			addTriangle(x[i][j], y[i][j], z[i][j], x[i][j+1], y[i][j+1], z[i][j+1], x[i+1][j], y[i+1][j], z[i+1][j]);
			addTriangle(x[i+1][j], y[i+1][j], z[i+1][j], x[i+1][j+1], y[i+1][j+1], z[i+1][j+1], x[i][j+1], y[i][j+1], z[i][j+1]);
		}
	}

	for(var i=0;i<triangles.length;i++) {
		normals.push(CalcNormal(triangles[i]));
		centers.push(CalcCenter(triangles[i]));
		var I = CalcI(i);

		DrawTriangle(context, triangles[i], convertColor(I*C[0], I*C[1], I*C[2]), 'fill');
	}
	console.log(normals);
}

function redraw() {
	for(var i=0;i<triangles.length;i++) {
		var I = CalcI(i);

		DrawTriangle(context, triangles[i], convertColor(I*C[0], I*C[1], I*C[2]), 'fill');
	}
}

function addTriangle(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
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

function CalcI(i) {
	I = k_diffuse * (0.5 * CalcCos(i) + 0.5);
	return I;
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
	for(var i=0;i<col;i++) {
		var x_temp = [];
		var y_temp = [];
		var z_temp = [];
		for(var j=0;j<row;j++) {
			if(col % 2 == 0)
				x_temp.push(Math.round(Math.random() * 100) - 50 + 1920 / row * j);
			else
				x_temp.push(Math.round(Math.random() * 100) - 50 + 1920 / row * j + 192);
			y_temp.push(Math.round(Math.random() * 100) - 50 + 1080 / col * i);
			z_temp.push(Math.round(Math.random() * 50));
		}
		x.push(x_temp);
		y.push(y_temp);
		z.push(z_temp);
	}
}

function drawBackground() {

}

document.addEventListener('mousemove', function(e){
	light_position = [e.pageX, e.pageY, 275];
	redraw();
	//info.textContent = sliderOnTouch;
});