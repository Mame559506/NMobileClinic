import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded shadow p-4 hover:shadow-md transition">
      <img src={product.image_url || '/placeholder.png'} alt={product.name}
        className="w-full h-48 object-cover rounded mb-3" />
      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
      <p className="text-blue-600 font-bold mt-1">GHS {product.price}</p>
      <Link to={`/products/${product.id}`}
        className="mt-3 block text-center bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm">
        View Details
      </Link>
    </div>
  )
}
