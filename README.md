# 3D Convex Hull
This GitHub Repository contains Molly Daniel and Sydney Weisberg's final project for CSC 372: Applied Algorithms.

## Project Description
The goal of this project is to develop a visualization program for 3D convex hull detection. We implemented three different convex hull algorithms - Naive Extreme Faces O(n^4), Randomized Incremental O(n^2), and QuickHull O(nlogn). We manually implemented both the naive algorithm and the incremental one, and used the scipy package for QuickHull. We additionally implemented a point-in-3D-hull algorithm to detect collisions. Finally, we modified Claude code to develop a frontend visualization program that uses our algorithms to build a convex hull and detect collisions.

## Installation and Run Instructions
1. Package Installation
- `pip install distance3d`
- `pip install scipy`
- `pip install flask`
- `pip install flask_cors`
2. Open two terminals
3. In one terminal run `python app.py`
4. In the second terminal run `python -m http.server 8000`
5. Open the server on http://localhost:8000/

## Visualization Instructions
- Press and hold left click to move around the 3D space
- Use the mouse scroll wheel to zoom in and out
- In "Edit" mode, you can add new points to an object using xyz coordinates by entering them in their respective boxes and clicking the `+ Add Point` button
- You can swap between the left and right objects by clicking the `Active` button
- If you would like to prepopulate an object with points forming a tetrahedron, click the `Sample Tetrahedron` button
- The `Reset View` button resets the view of the 3D space to what it originally was
- To go to collision detection mode, click the `Collision Mode` button
- You can drag the objects around by left clicking, holding, and moving them around
- The slider at the bottom of the screen moves the two objects closer together across the X coordinate
- The convex hull is automatically calculated, and if two objects collide, collision detection will trigger
