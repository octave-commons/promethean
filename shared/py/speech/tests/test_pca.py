import numpy as np
from shared.py.utils.embeddings_processing import PCA


def test_pca_reconstruction():
    data = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
    p = PCA(n_components=1)
    proj = p.build(data)
    recon = p.iproject(proj)
    assert recon.shape == data.shape
    # Reconstruction should be close to original data
    assert np.allclose(recon, data)
