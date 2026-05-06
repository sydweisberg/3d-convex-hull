'''
References (Online Python Implementations)
- https://github.com/rgmyr/pyConvexHull3D/blob/master/hull3D.py
- https://github.com/yuehaowang/convex_hull_3d/blob/master/convex_hull.py

- Overall complexity for Incremental 3D CH should be O(n^2)
- The two possible routes for this would be to use numpy arrays, or stick with tuples.
  We found it a bit easier to work with tuples, so we ended up going with that.
- While Sydney wrote out the pseudocode comments on her own, she used Claude to help with the algorithm a bit.
- Python dictionaries were chosen to store our edges and faces, since we need to map every two faces to an edge.
- Since we are randomizing the order of points, it's possible for a test case to fail, especially tests with minimal points.
  This is due to the points possibly being coplanar. You may need to run the tests multiple times to see them succeed.
'''

import numpy as np
import random

def findOrientation(p1, p2, p3, p4):
    # Use homogeneous coordinates to compute signed volume of tetrahedron
    p1 = np.array(p1)
    p2 = np.array(p2)
    p3 = np.array(p3)
    p4 = np.array(p4)

    matrix = np.array([[p1[0], p1[1], p1[2], 1],
                       [p2[0], p2[1], p2[2], 1],
                       [p3[0], p3[1], p3[2], 1],
                       [p4[0], p4[1], p4[2], 1]])
    orientation = np.linalg.det(matrix)
    if orientation > 0:
        return 1
    elif orientation < 0:
        return -1
    else:
        return 0
    
def orientationHelper(face, point):
    # Fix orientation of a face
    if findOrientation(face[0], face[1], face[2], point) == 1:
        return (face[0], face[2], face[1])
    return face

def edgeFaceMap(faces):
    # Makes a dictionary of edges with the keys being edges
    # and the faces as values
    # Thus, each edge should have two faces associated with it
    map = {}
    for face in faces:
        face_list = [(face[0], face[1]), (face[1], face[2]), (face[2], face[0])] 
        for u, v in face_list:
            key = tuple(sorted([tuple(u), tuple(v)])) # Edges are undirected for CH problem
            if key not in map:
                map[key] = []
            map[key].append(face)
    return map

def preprocess(points):
    # Remove duplicate points
    points = list(set(points))
    # Random incremental algorithm
    random.shuffle(points)
    return points
    
def buildHull(points):
    points = preprocess(points)
    p1, p2, p3, p4 = points[:4]

    # Make sure the orientation of the base case tetrahedron is correct
    # This defines them in CCW orientation (faces are outwards)
    faces = [(p1, p2, p3), (p1, p3, p4), (p1, p4, p2), (p2, p4, p3)]

    # If the 4 points are coplanar, return (we do not have capacity to handle this at this moment)
    if np.dot(np.cross(np.array(p2) - np.array(p1), np.array(p3) - np.array(p2)), np.array(p1) - np.array(p4)) == 0:
        return []

    # Set up the initial four faces of the base case tetrahedron
    faces[0] = orientationHelper(faces[0], p4)
    faces[1] = orientationHelper(faces[1], p2)
    faces[2] = orientationHelper(faces[2], p3)
    faces[3] = orientationHelper(faces[3], p1)

    for point in points[4:]:
        map = edgeFaceMap(faces)
        visible_faces = []
        # This part of the code checks to see if each face of the convex hull is visible from the new point
        # If any faces are visible from the point, it means that the point must be in the convex hull
        for face in faces:
            if findOrientation(face[0], face[1], face[2], point) > 0: # If face is CCW
                visible_faces.append(face)
        if not visible_faces:
            continue

        # From there, we need to determine how many faces attatched to each edge are visible
        # For example, if there is an edge where one face is visible and one is not, we know that
        # the new face of the hull is between the point and the two vertices of the edges
        # If an edge has two visible faces attatched to it, it means that the edge is not a part of the
        # convex hull
        # We are able to use this as a property since we know that every edge is associated with two faces
        boundary_edges = []
        for edge, adj_faces in map.items():
            count = 0
            for face in adj_faces:
                if face in visible_faces:
                    count += 1
            if count == 1:
                boundary_edges.append(edge)

        # Start building the new hull
        # We know that all of the faces that aren't visible from the point will be in the new hull
        # so we add those to the hull
        new_faces = []
        for face in faces:
            if face not in visible_faces:
                new_faces.append(face)
        faces = new_faces

        # Start building the faces that include the point and edges that have only one face visible
        new_faces = []
        # Ensures that we have a point inside the hull for comparison, since this gets the center of the initial tetrahedron
        interior_point = tuple((np.array(p1) + np.array(p2) + np.array(p3) + np.array(p4)) / 4)
        # Go through each of the edges that have one visible face
        # Make a new face that includes the point and edge
        # Ensure that the direction of the new faces is outwards
        for u, v in boundary_edges:
            face = (u, v, point)
            if findOrientation(face[0], face[1], face[2], interior_point) > 0:
                face = (u, point, v)
            new_faces.append(face)

        # Combine the non-visible faces with the new faces
        faces.extend(new_faces)

    return faces

# tests generated by copilot and claude
def main():
    # Test 1: Tetrahedron (4 points)
    print("Test 1: Tetrahedron")
    tetrahedron = [
        (0, 0, 0),
        (1, 0, 0),
        (0, 1, 0),
        (0, 0, 1)
    ]
    faces = buildHull(tetrahedron)
    print(f"  Input: {len(tetrahedron)} points")
    print(f"  Extreme faces: {len(faces)}")
    for f in faces:
        print(f"    {f}")

    # Test 2: Cube (8 points)
    print("\nTest 2: Cube")
    cube = [
        (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),
        (0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)
    ]
    faces = buildHull(cube)
    print(f"  Input: {len(cube)} points")
    print(f"  Extreme faces: {len(faces)}")
    for f in faces:
        print(f"    {f}")

    # Test 3: Pyramid (5 points)
    print("\nTest 3: Square Pyramid")
    pyramid = [
        (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),  # base
        (0.5, 0.5, 1)  # apex
    ]
    faces = buildHull(pyramid)
    print(f"  Input: {len(pyramid)} points")
    print(f"  Extreme faces: {len(faces)}")
    for f in faces:
        print(f"    {f}")

    # Test 4: Octahedron (6 points)
    print("\nTest 4: Octahedron")
    octahedron = [
        (1, 0, 0), (-1, 0, 0),
        (0, 1, 0), (0, -1, 0),
        (0, 0, 1), (0, 0, -1)
    ]
    faces = buildHull(octahedron)
    print(f"  Input: {len(octahedron)} points")
    print(f"  Extreme faces: {len(faces)}")  # Expected: 8 triangular faces

    # Test 5: Points with interior points that should be ignored
    print("\nTest 5: Cube with interior points")
    cube_with_interior = [
        (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),  # bottom face
        (0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1),  # top face
        (0.5, 0.5, 0.5),  # dead center — should be ignored
        (0.2, 0.3, 0.4),  # another interior point
    ]
    faces = buildHull(cube_with_interior)
    print(f"  Input: {len(cube_with_interior)} points")
    print(f"  Extreme faces: {len(faces)}")  # Should match plain cube

    # Test 6: Elongated shape (thin bounding box)
    print("\nTest 6: Elongated box (needle-like)")
    needle = [
        (0, 0, 0), (100, 0, 0),    # long axis along X
        (0, 0.1, 0), (100, 0.1, 0),
        (0, 0, 0.1), (100, 0, 0.1),
        (0, 0.1, 0.1), (100, 0.1, 0.1),
    ]
    faces = buildHull(needle)
    print(f"  Input: {len(needle)} points")
    print(f"  Extreme faces: {len(faces)}")  # Should still produce 6 faces like a box

    # Test 7: Duplicate points
    print("\nTest 7: Duplicate points")
    dupes = [
        (0, 0, 0), (0, 0, 0),  # exact duplicate
        (1, 0, 0), (1, 0, 0),
        (0, 1, 0),
        (0, 0, 1)
    ]
    faces = buildHull(dupes)
    print(f"  Input: {len(dupes)} points")
    print(f"  Extreme faces: {len(faces)}")  # Should behave like a tetrahedron

    # Test 8: Large random point cloud (stress test)
    import random
    print("\nTest 8: Random point cloud (stress test)")
    random.seed(42)
    cloud = [(random.uniform(-10, 10), random.uniform(-10, 10), random.uniform(-10, 10))
            for _ in range(200)]
    faces = buildHull(cloud)
    print(f"  Input: {len(cloud)} points")
    print(f"  Extreme faces: {len(faces)}")  # Hull should have far fewer faces than input points

    # Test 9: Points on a sphere surface (all on hull)
    import math
    print("\nTest 9: Points on a sphere (all extreme)")
    sphere_pts = []
    for i in range(8):
        for j in range(8):
            theta = math.pi * i / 7
            phi = 2 * math.pi * j / 8
            x = math.sin(theta) * math.cos(phi)
            y = math.sin(theta) * math.sin(phi)
            z = math.cos(theta)
            sphere_pts.append((x, y, z))
    faces = buildHull(sphere_pts)
    print(f"  Input: {len(sphere_pts)} points")
    print(f"  Extreme faces: {len(faces)}")  # All points are on the hull

if __name__ == "__main__":
    main()