from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.spatial import ConvexHull
import numpy as np
import traceback

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


def compute_hull(points):
    pts = np.array(points, dtype=float)
    pts = np.unique(pts, axis=0)

    if len(pts) < 4:
        return None

    if np.linalg.matrix_rank(pts - pts[0]) < 3:
        return None

    try:
        hull = ConvexHull(pts)
    except Exception as e:
        return None
    
    hull_verts = pts[hull.vertices].tolist()
    index_map = {old: new for new, old in enumerate(hull.vertices)}
    remapped = [[index_map[i] for i in face] for face in hull.simplices.tolist()]

    return {
        "vertices": hull_verts,
        "simplices": remapped
    }


@app.route("/hull", methods=["POST", "OPTIONS"])
def hull():
    if request.method == "OPTIONS":
        return "", 204
    data = request.json
    points = data.get("points", [])
    result = compute_hull(points)
    if result is None:
        return jsonify({"error": "Not enough non-coplanar points"}), 400
    return jsonify(result)


@app.route("/gjk", methods=["POST", "OPTIONS"])
def gjk():
    if request.method == "OPTIONS":
        return "", 204

    try:
        from distance3d import gjk as gjk_mod, colliders

        data = request.json

        raw_l = np.array(data["pointsL"], dtype=float)
        raw_r = np.array(data["pointsR"], dtype=float)
        offset_l = np.array(data.get("offsetL", [0, 0, 0]), dtype=float)
        offset_r = np.array(data.get("offsetR", [0, 0, 0]), dtype=float)

        pts_l = raw_l + offset_l
        pts_r = raw_r + offset_r

        hull_l = ConvexHull(np.unique(pts_l, axis=0))
        hull_r = ConvexHull(np.unique(pts_r, axis=0))

        verts_l = pts_l[hull_l.vertices]
        verts_r = pts_r[hull_r.vertices]

        collider_l = colliders.ConvexHullVertices(verts_l)
        collider_r = colliders.ConvexHullVertices(verts_r)

        dist, p1, p2, _ = gjk_mod.gjk(collider_l, collider_r)

        colliding = dist <= 1e-7

        return jsonify({
            "colliding": bool(colliding),
            "distance": float(dist),
            "p1": p1.tolist() if p1 is not None else None,
            "p2": p2.tolist() if p2 is not None else None,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)