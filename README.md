# 3D Convex Hull
This GitHub Repository contains Molly Daniel and Sydney Weisberg's final project for CSC 372: Applied Algorithms.

## Project Description
The goal of this project is to develop a visualization program for 3D convex hull detection. We implemented three different convex hull algorithms - Naive Extreme Faces O(n^4), Randomized Incremental O(n^2), and QuickHull O(nlogn). We manually implemented both the naive algorithm and the incremental one, and used the scipy package for QuickHull. We additionally implemented a naive point-in-3D-hull algorithm to detect collisions. We then used the distance3d package to implement GJK collision detection O(n). Finally, we modified Claude code to develop a frontend visualization program that uses our algorithms to build a convex hull and detect collisions.

## Installation and Run Instructions
1. Package Installation
- `pip install distance3d`
- `pip install scipy`
- `pip install flask`
- `pip install flask_cors`
  or
- `pip install -r requirements.txt`
2. To test naive implementations run `python naive.py` in the terminal
3. To run the Visualization
    - In one terminal run `python app.py`
    - In the second terminal run `python -m http.server 8000`
    - Open the server on http://localhost:8000/

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

## Project and Algorithm Overview
A convex hull is a set of points that forms a convex polygon of a list of all points. In 3D, the convex hull forms a convex polyhedron. Convex hulls are useful in many different fields, and have applications in robotics, image processing, data clustering, and mapping. Collision detection is another use case of convex hulls as it allows for more efficient tests due to the simplification of more complicated objects in 3D. Our contribution to this problem is an implementation of three different convex hull algorithms, two collision detection algorithms, and an AI-assisted visualization in 3D.

### Algorithms

#### Naive Convex Hull
The naive convex hull works by finding each triplet of points and seeing if every remaining point is on one side of the triplet. If all other points are on one side of the plane formed by the triplet of points, that face is part of the convex hull. Repeat until all faces have been checked.

Input: List of points

Output Faces of the convex hull

#### Incremental Convex Hull
The randomized incremental convex hull works by first forming a base case tetrahedron out of four points. The algorithm then increntally checks one point at time. It starts by computing the visible faces from the point. A face is visible if it passes a particular orietation test. Then, we check to see if the edges associated with each face are visible. Since an edge is associated with two faces, we know that edges where both faces are visible will not be part of the new convex hull. Edges where one face is visible from the point and the other is not will be part of the convex hull. For each of these edges where just on face is visible, we form a triangle between the point and the two vertices of the edge. This new face is then added to the convex hull, and the faces associated with edges where two faces are visible are removed from the convex hull. Repeat this step until we have visited every point in the list. 

Input: List of points

Output: Faces of the convex hull

#### Quickhull
Input: List of points

Output: Convex hull object (simplicies, vertices)

We chose to use the quickhull algorithm to build our convex hull visualization since it is the most efficient of these algorithms. Additionally, Scipy has a great and easy to use implementation of it. Quickhull is a divide and conquer algorithm that begins by finding the most extreme 4 points (guaranteed to be on the hull). 
1. An initial tetrahedron is formed from these 4 points. 
2. For each face on the tetrahedron, the farthest point from the face is added to the hull, forming a new tetrahedron with the initial face. No points inside this tetrahedron are on the hull. 
3. Step 2 is repeated with the remaining points outside of the tetrahedron

#### Naive Intersection
Input: Two points of two convex hulls

Output: Boolean, true if intersection, false if not

This algorithm checks if any point from convex hull 1 is inside any point from convex hull 2, and vice versa. It is extremely inefficient O(n^5) and does not account for situations in which only edges or faces are intersecting. 

#### Gilbert-Johnson-Keerthi (GJK) Algorithm
Input: Points from the left and right convex hulls, position offsets of each convex hull

Output: Boolean, true if collision, false if not, and distance between objects

We chose to use GJK to detect collisions since it works better than our naive intersection algorithm, it is super efficient, and widely used in robotics and game development. Since the naive algorithm just handles point-inside-point detection, GJK is able to handle more cases for collision.

GJK works by finding the Minkowski difference (all possible vector differences) of two hulls and then using simplices within the difference to determine whether or not the origin is contained in the difference. If the origin is within this set, the two convex shapes collide. Instead of calculating the entire Minkowski difference, GJK uses a support function to find useful points within the difference.  

### Work Breakdown
We both contributed equally to this project. Molly focused on implementing the naive convex hull algorithm, naive intersection, and GJK. Sydney focused on implementing incremental convex hull. We both worked on implementations of quickhull, and took turns contributing to the visualization. Finally, we checked each others work, and communicated throughout the project about design and implementation decisions regardless of the specific algorithm we were working on. The work and time spent on the project was split 50/50.
### Sources
- CSC 372 Homework 5 (foundation of convex hull understanding)
- CSC 372 Homework 6 (orientation test primatives)
- https://github.com/rgmyr/pyConvexHull3D/blob/master/hull3D.py (incremental convex hull)
- https://github.com/yuehaowang/convex_hull_3d/blob/master/convex_hull.py (incremental convex hull)
- https://claude.ai/ (visualization, incremental convex hull)
- https://cse442-17f.github.io/Gilbert-Johnson-Keerthi-Distance-Algorithm/ (GJK)
- https://www.youtube.com/watch?v=ajv46BSqcK4&t=1678s
