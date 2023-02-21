
const mysql=require('mysql')
const {query}=require('./query')
async function connectionMysql(value){
const {host,user,password,database,port}=value
 const p=await new Promise((resolve,reject)=>{
    try{
      // 连接数据库
      var connection = mysql.createConnection({host,user,password,database,port});
      // 连接数据库 
      connection.connect() 
      resolve(connection)
    }catch(e){
      reject(e)
    }
  })
    // 判断连接是否成功
  if(typeof p == 'function' ||typeof  p == 'object')
    return p
  else{
    return Promise.reject('error')
  }
}

/**
 * 
 * @param {object} dbs 数据库对象
 * @param {string} table  插入表名
 * @param {object} book_json 插入数据
 */
async function insertData(dbs,table,book_json){
// 1.2不包含：添加数据：
  // 1{给books_info中book_name添加book_name数据}
  //  2{给books_content里添加{book_name和passage_value和passage_name和content}数据}

  // 判断数据有效性

  if(typeof book_json === 'string')
    book_json=JSON.parse(book_json)

  const signal=await new Promise((res,rej)=>{
    let conditions=''
    let values='';

    Object.keys(book_json).forEach((item,index)=>{
      conditions+=item+','
      if(typeof book_json[item] === 'string')
        values+=`"${book_json[item]}",`
      else
        values+=book_json[item]+','

      if(index==Object.keys(book_json).length-1){
        conditions=conditions.trim().substring(0,conditions.length-1)
        values=values.trim().substring(0,values.length-1)
        let sql=`insert into ${table}(${conditions}) values(${values})`
        dbs.query(sql,(error,result)=>{
          if(error){
              console.log('插入失败');
              console.log(error,'出错');

            rej(error)
          } 
          res(result)
        })
      }
    })

    
  })
  // 插入失败
  if(!(signal instanceof Object))
    return Promise.reject(signal)
  else
    return signal

}
/**
 * 
 * @param {object} dbs 数据库对象
 * @param {string} table  查询的表名
 * @param {string} book_name 书名
 */
async function get_book_directory(dbs,table,book_name){
  
  const signal=await new Promise((resolve,reject)=>{
      let sql=`select passage_name from ${table} where book_name="${book_name}"`
      dbs.query(sql,function(error,result){
        if(error) reject(error)
        resolve(result)
      })
  })
    // 插入失败
  if(!(signal instanceof Object))
    return Promise.reject(signal)
  else
    return signal
}

/**
 * @param {object} dbs 数据库对象
 * @param {string} table  查询的数据库及表名
 * @param {object} primary_key 更新记录中主键的对象
 * @param {string} old_value 更新的属性名
 * @param {number|string} new_value 更新的属性值
 * @param {number|string} type 更新的属性值的类型
 * @param {string} operation +-*\/
 */
async function update(dbs,table,primary_key,old_value,value,type,operation){

  const signal=await new Promise((resolve,reject)=>{

    query(dbs,table,'',primary_key).then(e=>{
      if(e.length<=0){
        // 找不到该记录（无法进行更新）
        reject('找不到该记录')
        return
      }
      // 找到了
      let condition=''
      for(let i in primary_key){
        if(typeof primary_key[i] === 'string')
          condition=`${i}='${primary_key[i]}'`
        else
          condition=`${i}=${primary_key[i]}`
        break;
      }
      if(type !== null || type !== undefined)
        if(type === 'string'){
          value="'"+value+"'"
        }
      let OPERATION=''
      if(operation !== undefined){
        OPERATION=old_value+operation
      }else
        OPERATION=''

      let sql=`update ${table} set ${old_value}=${OPERATION}${value} where ${condition}`
      dbs.query(sql,function(err,result){
        if(err){
          reject(err)
          return
        }
          resolve(result)
      })
    }).catch(e=>{
      reject(e)
    })
})
  // 更新失败
if(!(signal instanceof Object))
  return Promise.reject(signal)
else
  return signal  
}

exports.connectionMysql=connectionMysql
exports.insertData=insertData
exports.get_book_directory=get_book_directory
exports.update=update
