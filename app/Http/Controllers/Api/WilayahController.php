<?php

namespace App\Http\Controllers\Api;

use App\Data\RegionData;
use App\Http\Controllers\Controller;

class WilayahController extends Controller
{
    public function provinces()
    {
        return response()->json(RegionData::provinces());
    }

    public function regencies($provinceId)
    {
        return response()->json(RegionData::regencies($provinceId));
    }

    public function districts($regencyId)
    {
        return response()->json(RegionData::districts($regencyId));
    }

    public function villages($districtId)
    {
        return response()->json(RegionData::villages($districtId));
    }
}
