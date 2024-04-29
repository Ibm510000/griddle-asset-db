
import sys
import os
from pxr import Gf, Kind, Sdf, Usd, UsdGeom, UsdShade
import time

def create_variant_set(prim: Usd.Prim, variant_set_name: str, variants: list) -> Usd.VariantSet:
    variant_set = prim.GetVariantSets().AddVariantSet(variant_set_name) 
    for variant in variants:
        variant_set.AddVariant(variant)


    return variant_set

def add_sub_layer(sub_layer_path, root_layer):
    sub_layer = Sdf.Layer.CreateNew(sub_layer_path)
    # You can use standard python list.insert to add the subLayer to any position in the list
    root_layer.subLayerPaths.append(sub_layer.identifier)
    return sub_layer

def  CreateNewUSD(a):
    
    print(sys.version)
    print("Creating new USD Assets list .. .. ..")
    print(a)

    raw_s = r'{}'.format(a)
    last_name = raw_s.split("\\")[-2]
    print(last_name)


    MainName = last_name.split("_")[0]+".usda"
    MainName_material = last_name.split("_")[0]+"_material.usda"
    MainName_model = last_name.split("_")[0]+"_model.usda"
    MainName_lod0 = last_name.split("_")[0]+"_lod0.usda"
    MainName_lod1 = last_name.split("_")[0]+"_lod1.usda"
    MainName_lod2 = last_name.split("_")[0]+"_lod2.usda"

    MainDir = a+ MainName
    MainDir_material = a+MainName_material
    MainDir_model = a+ MainName_model

    MainDir_lod0 = a+ MainName_lod0
    MainDir_lod1 = a+ MainName_lod1
    MainDir_lod2 = a+ MainName_lod2



    print(MainDir)
    print(MainDir_material)
    print(MainDir_model)
    #stage_material = Usd.Stage.CreateNew(MainDir_material)
    #stage_model = Usd.Stage.CreateNew(MainDir_model)
    #stage_material.GetRootLayer().Save()
    #stage_model.GetRootLayer().Save()


    stage_Main = Usd.Stage.CreateNew(MainDir)
    default_prim: Usd.Prim = UsdGeom.Xform.Define(stage_Main, Sdf.Path("/World")).GetPrim()
    stage_Main.SetDefaultPrim(default_prim)


        
    sub_layer1= add_sub_layer(MainDir_material, stage_Main.GetRootLayer())
    sub_layer2= add_sub_layer(MainDir_model, stage_Main.GetRootLayer())
        

    #stage_Main.GetRootLayer().Save()
        
    usda = stage_Main.GetRootLayer().ExportToString()
    print(usda)
    
    # Check to see if the sublayer is loaded 
    loaded_layers = stage_Main.GetRootLayer().GetLoadedLayers()
    assert sub_layer1 in loaded_layers
    assert sub_layer2 in loaded_layers

    stage_Main.GetRootLayer().Save()


    # three LODS

    stage_LOD0 = Usd.Stage.CreateNew(MainDir_lod0)
    stage_LOD1 = Usd.Stage.CreateNew(MainDir_lod1)
    stage_LOD2 = Usd.Stage.CreateNew(MainDir_lod2)

    default_prim_model2 = UsdGeom.Xform.Define(stage_LOD0, Sdf.Path("/World")).GetPrim()
    stage_LOD0.SetDefaultPrim(default_prim_model2)
    stage_LOD0.GetRootLayer().Save()

    default_prim_lod1= UsdGeom.Xform.Define(stage_LOD1, Sdf.Path("/World")).GetPrim()
    default_prim_lod2= UsdGeom.Xform.Define(stage_LOD2, Sdf.Path("/World")).GetPrim()
    
    
    stage_LOD1.SetDefaultPrim(default_prim_lod1)
    stage_LOD2.SetDefaultPrim(default_prim_lod2)

    stage_LOD1.GetRootLayer().Save()
    stage_LOD2.GetRootLayer().Save()




    stage_model = Usd.Stage.Open(MainDir_model)

    default_prim_model = UsdGeom.Xform.Define(stage_model, Sdf.Path("/World")).GetPrim()
    stage_model.SetDefaultPrim(default_prim_model)
    stage_model.GetRootLayer().Save()
    variants = ["LOD0", "LOD1", "LOD2"]

    model_varset = create_variant_set(default_prim_model, "model", variants)

    model_varset.SetVariantSelection('LOD0')
    with model_varset.GetVariantEditContext():
        default_prim_model.GetReferences().AddReference(MainDir_lod0)

    model_varset.SetVariantSelection('LOD1')
    with model_varset.GetVariantEditContext():
        default_prim_model.GetReferences().AddReference(MainDir_lod1)

    model_varset.SetVariantSelection('LOD2')
    with model_varset.GetVariantEditContext():
        default_prim_model.GetReferences().AddReference(MainDir_lod2)


    stage_model.GetRootLayer().Save()
    
    try:
        raise KeyboardInterrupt  # Simulating a keyboard interrupt
    except KeyboardInterrupt:
        input("Press Enter to exit...") 
    




    

if __name__ == "__main__":
    a = sys.argv[1]
    CreateNewUSD(a)