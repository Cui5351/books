/**
 * 
 * @param {object} dbs dbs为mysql连接后的对象
 * @param {string} db_name 数据库及表名(数据库.表名)
 * @param {array|string} select select的数据,若为null/undefined/''空字符串(即为*)
 * @param {object} conditions where过滤的数据(对象)
 * @param {object} limit skip:跳多少数据,count:取多少数据
 * @param {object} order order:(desc/asc),by:(排序字段)
 * @param {boolean} distinct 是否去重
 */
async function query(dbs,db_name,select,conditions,limit,order,distinct){
    const signal=await new Promise((res,rej)=>{
        try{
            let Select=''
            let Conditions=''
            let Limit=''
            let Order=''
            let Distinct=''
            // 1判断select * 有没有数据，若为null/undefined/''空字符串（即为*）
            if(select === null || select === undefined)
                Select='*'
            else if(!select.length)
                Select='*'
            else if(select instanceof Array){
                select.forEach((item)=>{
                    Select+=item+','
                })
                Select=Select.substring(0,Select.length-1)
            }else if(typeof select === 'string'){
                Select=select
            }else
                Select=''

            // 2条件condition拼接为字符串
            if(conditions === null||conditions === undefined)
                Conditions=''
            else if(!Object.keys(conditions).length||!(conditions instanceof Object)){
                Conditions=''
            }else{
                Conditions=' where '
                Object.keys(conditions).forEach((item,index)=>{
                    Conditions+=`${item}="${conditions[item]}" AND `
                    if(index==Object.keys(conditions).length-1)
                        Conditions=Conditions.substring(0,Conditions.length-5)
                })
            }
            if(limit === null||limit === undefined)
                Limit=''
            else if(!(limit instanceof Object)||!Object.keys(limit).length){
                Limit=''
            }else{
                if((limit.hasOwnProperty('skip'))||(limit.hasOwnProperty('number'))){
                    if(!(typeof limit.skip==='number')||!(typeof limit.count==='number')||limit.skip<0||limit.count<0){
                        // 默认
                        limit.skip=0
                        limit.count=10
                    }
                }else{
                    limit.skip=0
                    limit.count=10
                }
                Limit=' limit '+limit.skip+','+limit.count
            }
            if(order === null||order === undefined)
                Order=''
            else if(!(order instanceof Object)||!(order.hasOwnProperty('order'))||!(order.hasOwnProperty('by'))||!(typeof order.order)==='string'||!(typeof order.by==='string')||(order === null)){
                Order=''
            }else{
                Order=` order by ${order.by} ${order.order}`
            }

            // 5 是否去重
            if(distinct == null|| distinct == undefined || distinct == ''){

            }else
                Distinct='distinct'

            // 3查询拼接
            dbs.query(Distinct+' select '+Select+' from '+db_name+Conditions+Order+Limit,function(err,result){
                if(err) rej(err)
                res(result)
            })
        }catch(e){
            rej(e)
        }
    })

    if(!(signal instanceof Object))
        return Promise.reject(signal)
    else
        return signal
}
exports.query=query