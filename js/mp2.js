$(document).ready(function(){
//    var webgl = new WebGL(document.getElementById("mp2-canvas"));
    //main(document.getElementById("mp2-canvas"));
	$('#start_sim').click(function(){
		// Get option values
		terrain_size = parseFloat($('#terrain_size').val());
		size_x = parseFloat($('#size_x').val());
		size_y = parseFloat($('#size_y').val());
		noise_size_x = parseFloat($('#noise_size_x').val());
		noise_size_y = parseFloat($('#noise_size_y').val());
		max_height = parseFloat($('#max_height').val());
		position = vec3.create([terrain_size/2, 0, 1.2, 1]);
		
		// Start
		main(document.getElementById("mp2-canvas"));
	});
	$('#ufo_mode').change(function(){
		ufo_mode = ($(this).attr('checked'))?true:false;
	});
});

var terrain_size;
var size_x;
var size_y;
var noise_size_x;
var noise_size_y;
var max_height;
var ufo_mode = false;


$(document).bind('keydown', function(e){
	var key = e.keyCode;
	var right = vec3.create();
	vec3.cross(forward, up, right);
	var rotateMatrix = mat4.create();
	mat4.identity(rotateMatrix);
	if(key == 87){ //w
		vertical_angular_velocity = -0.30;
	}
	if(key == 83){ //s
		vertical_angular_velocity = 0.30;
	}
	if(key == 65){ //a
		roll_angular_velocity = -0.30;
	}
	if(key == 68){ //d
		roll_angular_velocity = 0.30;
	}
	if(key == 189){ // -
		velocity -= 0.01;
	}
	if(key == 187){ // +
		velocity += 0.01;
	}
});

$(document).bind('keyup', function(e){
	var key = e.keyCode;
	if(key == 83 || key == 87){ //s
		vertical_angular_velocity = 0;
	}
	if(key == 65 || key == 68){ //a
		roll_angular_velocity = 0;
	}
});

//function WebGL(canvas){
function main(canvas){
    initGL(canvas);
    initBuffers();
    initShaders();

    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}

var gl;
var shaderProgram;

function initGL(canvas){
    try{
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }catch(e){
        if(!gl){
            alert("WebGL canvas could not be initialized.");
        }
    }
}

/**
 * Initalize shaders
 */
function initShaders(){
    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShader = getShader(gl, "shader-fs");

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Could not initialize shader program.");
    }

    gl.useProgram(program);

    // Set vertex position attribute
    program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    // Set vertex normal attribute
    program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);


    // Set vertex color attribute
    //program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
    //gl.enableVertexAttribArray(program.vertexColorAttribute);

    // Set uniform locations
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");

    program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
    program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
    program.lightingDirectionUniform = gl.getUniformLocation(program, "uLightingDirection");
    program.directionalColorUniform = gl.getUniformLocation(program, "uDirectionalColor");

    program.positionUniform = gl.getUniformLocation(program, "uPosition");
    program.forwardUniform = gl.getUniformLocation(program, "uForward");
    program.upUniform = gl.getUniformLocation(program, "uUp");

    shaderProgram = program;
}

var pMatrix = mat4.create();

/**
 * Set matrix uniform variables
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

/**
 * Initialize buffers
 */
var mountainVertexPositionBuffer;
var mountainVertexNormalBuffer;
var mountainVertexColorBuffer;
function initBuffers(){
    var mountain = getMountain(terrain_size, size_x, size_y, noise_size_x, noise_size_y, max_height);
    var mountainVertices = mountain[0];
    var mountainNormals = mountain[1];

    // Create vertex buffer
    mountainVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mountainVertexPositionBuffer);
    var vertices = mountainVertices;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    mountainVertexPositionBuffer.itemSize = 3;
    mountainVertexPositionBuffer.numItems = mountainVertices.length/3;

    // Create vertex normal buffer
    mountainVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mountainVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mountainNormals), gl.STATIC_DRAW);  
    mountainVertexNormalBuffer.itemSize = 3;
    mountainVertexNormalBuffer.numItems = mountainNormals.length/3;
}



var angle = 0;
var last = 0;

var forward = vec3.create([0, 0.9924753308296204, -0.12244734913110733]);
var up = vec3.create([0, 0, 1, 0]);
var position = vec3.create([12, 0, 1.2, 1]);
var velocity = 0.20;

var vertical_angular_velocity = 0;
var roll_angular_velocity = 0;

function tick(){
    requestAnimFrame(tick);
    display();
	
	$("#up>span").html("x:"+up[0]+"<br/>y:"+up[1]+"<br/>z:"+up[2]);
	$("#forward>span").html("x:"+forward[0]+"<br/>y:"+forward[1]+"<br/>z:"+forward[2]);
	$("#position>span").html("x:"+position[0]+"<br/>y:"+position[1]+"<br/>z:"+position[2]);
	$('#velocity>span').html(velocity);

    var now = new Date().getTime();
    if(last != 0){
        var delta = (now - last)/1000
		// Move forward
		position[0] += delta * velocity * forward[0];
		position[1] += delta * velocity * forward[1];
		position[2] += delta * velocity * forward[2];
		
		// Rotate based on roll
		// normal vector of forward-z plane
		var n_fz = vec3.create();
		vec3.cross(forward, vec3.create([0,0,1]), n_fz);
		vec3.normalize(n_fz);
		var roll = vec3.dot(n_fz, up); // both vectors are unit so cosB = dot(n_fz, up)
		
		// Turn according to roll
		var rotateMatrix = mat4.create();
		mat4.identity(rotateMatrix);
		mat4.rotate(rotateMatrix, -1 * delta * Math.tan(roll), up);
		mat4.multiplyVec3(rotateMatrix, forward);
		
		// Pitch up or down
		var right = vec3.create();
		vec3.cross(forward, up, right);
		mat4.identity(rotateMatrix);
		mat4.rotate(rotateMatrix, delta * vertical_angular_velocity, right);
		mat4.multiplyVec3(rotateMatrix, up);
		mat4.multiplyVec3(rotateMatrix, forward);
		
		// Roll sideways
		mat4.identity(rotateMatrix);
		mat4.rotate(rotateMatrix, delta * roll_angular_velocity, forward);
		mat4.multiplyVec3(rotateMatrix, up);
    }
    last = now;
}





function display(){
    // Set viewport
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // Clear screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    // Setup perspective matrix
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, mountainVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mountainVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, mountainVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);  

    // Ambient light Color
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.8, 0.8, 0.8);

	
	if(ufo_mode){
		var lightingDirection = forward;
	}else{
		var lightingDirection = [0, 0.8944714069366455, -0.44713249802589417];
	}
    var adjustedLD = vec3.create();
    vec3.normalize(lightingDirection, adjustedLD);
    vec3.scale(adjustedLD, -1);
    gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

    gl.uniform3f(shaderProgram.directionalColorUniform, 0.9, 0.9, 0.9);

    gl.uniform3fv(shaderProgram.positionUniform, position);
    gl.uniform3fv(shaderProgram.forwardUniform, forward);
    gl.uniform3fv(shaderProgram.upUniform, up);
	
    // Set matrix uniforms and draw
    setMatrixUniforms();
	
    gl.drawArrays(gl.TRIANGLES, 0, mountainVertexPositionBuffer.numItems);
}



/**
 * Helper funciton that gets shader from dom
 */
function getShader(gl, id){
    var script = document.getElementById(id);
    if(!script) return null;

    // Get source text of shdaer
    var source = "";
    var currentElement = script.firstChild;
    while(currentElement){
        if(currentElement.nodeType == 3){
            source += currentElement.textContent;
        }
        currentElement = currentElement.nextSibling;
    }

    // Get shader object
    var shader;
    if(script.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }else if(script.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }else{
        alert("Unknown script type.");
        return null;
    }
    
    // Set shader source and compile
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Alert if error occurs
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}
