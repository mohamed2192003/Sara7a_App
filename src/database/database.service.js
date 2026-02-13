// await userModel.findOne({ email, provider: ProviderEnums.System }).select('-password -_id')
export const findOne =async ({
    model,  // => userModel,
    filter = {},  // => { email, provider: ProviderEnums.System }
    select = "",  // => '-password -_id'
    options = { }
})=>{
    let doc = model.findOne(filter)
    if(select.length){
        doc.select(select)
    }
    if(options.populate){
        doc.populate(options.populate)
    }
    return await doc
}
export const findAll =async ({
    model,
    filter = {},
    select = "",  
    options = { }
})=>{
    let doc = model.find(filter)
    if(select.length){
        doc.select(select)
    }
    if(options.populate){
        doc.populate(options.populate)
    }
    return await doc
}
export const findByIdAndDelete = async ({
    model,
    id,
    select = "",
    options = {}
}) => {

    let doc = model.findByIdAndDelete(id)

    if (select.length) {
        doc.select(select)
    }

    if (options.populate) {
        doc.populate(options.populate)
    }

    return await doc
}
export const findByIdAndUpdate = async ({
    model,
    id,
    data = {},      // data to update
    select = "",
    options = {}
}) => {

    let doc = model.findByIdAndUpdate(
        id,
        data,
        { new: true, ...options }
    )

    if (select.length) {
        doc.select(select)
    }

    if (options.populate) {
        doc.populate(options.populate)
    }

    return await doc
}
export const findById = async ({
    model,          
    id,             
    select = "",    
    options = {}
}) => {

    let doc = model.findById(id)

    if (select.length) {
        doc.select(select)
    }

    if (options.populate) {
        doc.populate(options.populate)
    }

    return await doc
}
