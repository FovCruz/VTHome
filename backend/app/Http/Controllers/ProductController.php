<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index() {
        return Product::orderBy('stock', 'asc')->get();
    }

    public function store(Request $request) {
        $product = Product::create($request->all());
        $this->updateStatus($product);
        return $product;
    }

    public function update(Request $request, $id) {
        $product = Product::findOrFail($id);
        $product->update($request->all());
        $this->updateStatus($product);
        return $product;
    }

    private function updateStatus($product) {
        $product->status = $product->stock > 0 ? 'Disponible' : 'Agotado';
        $product->save();
    }

    public function destroy($id) {
        return Product::destroy($id);
    }
}
