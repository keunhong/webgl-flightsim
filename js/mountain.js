function getMountain(scale, sizeX, sizeY, noiseSizeX, noiseSizeY, maxHeight){
	return mountain2(scale, sizeX, sizeY, noiseSizeX, noiseSizeY, maxHeight);
}

/*
 * Generates a mounstain mesh with normals
 * using perlin noise
 */
function mountain2(scale, sizeX, sizeY, noiseSizeX, noiseSizeY, maxHeight){
	
	// Make array to store vertices
	var vertices = new Array(sizeX);
	for(var i = 0; i < sizeY; i++){
		vertices[i] = new Array(sizeY);
	}
	
	// Generate noise and smooth
	var noise = rawNoise2D(Math.floor(2+noiseSizeX), Math.floor(2+noiseSizeY), maxHeight);
	noise = smoothNoise2D(noise);
		
	for(var x = 0; x < sizeX; x++){
		for(var y = 0; y < sizeY; y++){
			samplex = x*scaleRange(0, sizeX-1, 0, (noiseSizeX-2));
			sampley = y*scaleRange(0, sizeY-1, 0, (noiseSizeY-2));
			var sample = bilinearInterpolate(samplex, sampley, noise);
			var xcoord = scale/sizeX*x;
			var ycoord = scale/sizeY*y;
			var zcoord = sample;
			
			vertices[x][y] = [xcoord, ycoord, zcoord];
		}
	}
	
	var mesh = [];
	var normals = [];
	for(var x = 0; x < sizeX-1; x++){
		for(var y = 0; y < sizeY-1; y++){
			// Triangle 1
			var v1 = vec3.create(vertices[x][y]);
			var v2 = vec3.create(vertices[x+1][y]);
			var v3 = vec3.create(vertices[x][y+1]);
			var v4 = vec3.create(vertices[x+1][y+1]);
			
			var top = vec3.create(); vec3.subtract(v2, v1, top);
			var left = vec3.create(); vec3.subtract(v1, v3, left);
			var bottom = vec3.create(); vec3.subtract(v4, v3, bottom);
			var right = vec3.create(); vec3.subtract(v4, v2, right);

			mesh.push(v1[0], v1[1], v1[2]);
			mesh.push(v2[0], v2[1], v2[2]);
			mesh.push(v3[0], v3[1], v3[2]);
					
			// Create normals
			var normal = vec3.create();
			vec3.cross(left, top, normal);
			vec3.normalize(normal);
			normals.push(normal[0], normal[1], normal[2]);
			normals.push(normal[0], normal[1], normal[2]);
			normals.push(normal[0], normal[1], normal[2]);
			
			// Triangle 2
			mesh.push(v3[0], v3[1], v3[2]);
			mesh.push(v2[0], v2[1], v2[2]);
			mesh.push(v4[0], v4[1], v4[2]);
			
			// Create normals
			normal = vec3.create();
			vec3.cross(bottom, right, normal);
			vec3.normalize(normal);
			normals.push(normal[0], normal[1], normal[2]);
			normals.push(normal[0], normal[1], normal[2]);
			normals.push(normal[0], normal[1], normal[2]);
		}
	}
	
	return [mesh, normals];
}

/*
 * Returns the scaling factor to map from one range
 * to another
 */
function scaleRange(fromMin, fromMax, toMin, toMax) {
	return (toMax-toMin-1)/(fromMax-fromMin-1);
}

function rawNoise2D(numPointsX, numPointsY, max){
	numPointsX += 2;
	numPointsY += 2;
	
	var result = new Array(numPointsX);
	for(var i = 0; i < numPointsX; i++){
		result[i] = new Array(numPointsY);
	}
	
	for(var x = 0; x < numPointsX; x++){
		for(var y = 0; y < numPointsY; y++){
			result[x][y] = Math.random()*max;
		}
	}
		
	return result;
}

function smoothNoise2D(rawNoise){
	var numPointsX = rawNoise.length-2;
	var numPointsY = rawNoise[0].length-2;
	var result = new Array(numPointsX);
	for(var i = 0; i < numPointsX; i++){
		result[i] = new Array(numPointsY);
	}
	
	for(var x = 1; x < numPointsX; x++){
		for(var y = 1; y < numPointsY; y++){
			var corners = (rawNoise[x-1][y-1] + rawNoise[x+1][y-1] + rawNoise[x-1][y+1] + rawNoise[x+1][y+1]) / 16;
			var sides = (rawNoise[x-1][y] + rawNoise[x+1][y] + rawNoise[x][y-1] + rawNoise[x][y+1])/8;
			var center = rawNoise[x][y] / 4;
			result[x-1][y-1] = corners + sides + corners;
		}
	}

	return result;
}

function bilinearInterpolate(x, y, s){
	x0 = Math.floor(x);
	y0 = Math.floor(y);
	x1 = Math.ceil(x);
	y1 = Math.ceil(y);

	// Handle edge cases
	if(x == 0){
		x1 += 1
	}
	if(y == 0){
		y1 += 1;
	}

	// Add one for edge cases
	q00 = s[x0+1][y0+1];
	q01 = s[x0+1][y1+1];
	q10 = s[x1+1][y0+1];
	q11 = s[x1+1][y1+1];


	return q00/((x1-x0)*(y1-y0)) * (x1-x) * (y1-y) +
			q10/((x1-x0)*(y1-y0)) * (x-x0) * (y1-y) +
			q01/((x1-x0)*(y1-y0)) * (x1-x) * (y-y0) +
			q11/((x1-x0)*(y1-y0)) * (x-x0) * (y-y0)
}