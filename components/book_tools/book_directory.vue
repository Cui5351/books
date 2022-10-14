<template>
	<view class="container" :style="{height:window_height*0.7+'px'}">
		<view style="text-align: center;font-size:25px;font-weight: bold;max-height:70px;">{{book_name}}</view>
		<view class="select">
			<view @click="change_dire(true)">{{current_directory.directory}}</view>
			<view @click="change_dire(false)">{{current_directory.passage}}{{current_directory.passage!='请先选择'?'章':''}}</view>
		</view>
		<scroll-view class="passages" scroll-y="true" v-if="toggle">
			<!-- 每次显示100章 -->
			<view class="passages_title" @click='book_passage(item)' :style="{borderBottom:`1rpx solid ${background_color.color?'gray':'white'}`,minHeight:passage_height*1.5+'px',maxHeight:passage_height*1.5+'px',lineHeight:passage_height*1.5+'px'}" v-for="(item,index) in total_passage" :key="index">
				{{item.start}}-{{item.end}}&ensp;章
			</view>
		</scroll-view>
		<scroll-view class="passages" v-if="!toggle" @scroll="scroll_change" :scroll-top="scrollTop" scroll-y="true" >
					<view class="passages_title" :style="{borderBottom:`1rpx solid ${background_color.color?'gray':'white'}`,minHeight:passage_height*1.5+'px',maxHeight:passage_height*1.5+'px',lineHeight:passage_height*1.5+'px'}" v-for="(item,index) in current_passage" :key="index" @click="toggle_passage2(item)">
						{{item.passage_name}}
					</view>
		</scroll-view>
	</view>
</template>

<script>
import {ref,reactive} from 'vue'
export default {
	name:'book_directory',
	setup(props){
		let scrollTop=ref(0)
		let total_passage=reactive([])
		let current_directory=reactive({
			directory:'1-101章',
			passage:'请先选择'
		})
		let current_passage=reactive([])
		let timer=ref(0)
		let toggle=ref(true)
		function change_dire(e){
			if(current_directory.passage=='请先选择')
				return
			if(e==toggle.value)
				return
			toggle.value=e
		}
		function book_passage(current_b){
			current_directory.directory=`${current_b.start}-${current_b.end} 章`
			toggle.value=false
			// 网络请求
			// 查看是否存在
			for(let item2 of props.directory_list){
				// 找到了
				if(item2.index==current_b.start){
					// 清空
					let length=current_passage.length
					for(let i=0;i<length;i++)
						current_passage.pop()
					// 再进行设置
					current_passage.push(...item2.passage)
					return
				}
			}
				
				uni.request({
						url:"https://www.mynameisczy.asia:5351/getBookDirectory",
						method:"POST",
						data:{
							book_name:props.book_name,
							skip:current_b.start,
							count:100
						},success(value){
							// 章节名value
							if(value.data.value.length>0){
								uni.current_this9.directory_list.push({
									index:value.data.value[0].passage_value-1,
									passage:[...value.data.value]
								})
								// 清空
								let length=current_passage.length
								for(let i=0;i<length;i++)
									current_passage.pop()
									
								uni.current_this9.current_passage.push(...value.data.value)
								// 将章节名缓存
								uni.setStorage({
									key:uni.current_this.book_name+'_directory',
									data:uni.current_this9.directory_list
								})
						}
						uni.hideLoading()
								
						// 将章节内容缓存
						// uni.setStorage({
							// key:props.book_name+'_directory',
							// data:directory_list
						// })
					},fail(e) {
						console.log(e)
					},
					})
		}
		function toggle_passage2(item){
			current_directory.passage=item.passage_value
			props.toggle_passage(item)
		}
		return {scrollTop,toggle_passage2,timer,toggle,total_passage,current_directory,current_passage,change_dire,book_passage}
	},
	beforeUnmount() {
// 做记录章节滚动的还原
		// uni.setStorage({
		// 	key:'scroll_bar'+this.book_name,
		// 	data:this.scrollTop
		// })
		
		
		uni.setStorage({
			key:'passage'+this.book_name,
			data:this.current_directory
		})
	},
	mounted() {
		uni.current_this9=this
		// 所有章节
		uni.getStorage({
			key:'passage'+this.book_name,
			success(result) {
				uni.current_this9.current_directory.directory=result.data.directory
				if(result.data.passage=='请先选择'){
					return
				}
				
				// 遍历directory_list是否含有result.data.passage的章节
				// uni.current_this9.directory_list
				for(let item2 of uni.current_this9.directory_list){
					// 找到了
			// 这里进行判断，是否包含--------------------------------------------
					if(item2.index<=result.data.passage&&(item2.index+100)>=result.data.passage){
						console.log('find');
						// 清空
						let length=uni.current_this9.current_passage.length
						for(let i=0;i<length;i++)
							uni.current_this9.current_passage.pop()
						// 再进行设置
						uni.current_this9.current_passage.push(...item2.passage)
						uni.current_this9.current_directory.passage=result.data.passage
						
			// 做记录章节滚动的还原
						// uni.getStorage({
						// 	key:'scroll_bar'+uni.current_this9.book_name,
						// 	success(e) {
						// 		uni.current_this9.scrollTop=e.data
						// 		console.log('setScroll',uni.current_this9.scrollTop);
						// 	}
						// })
						// 在这里设置scrollTop
						uni.current_this9.toggle=false
					}
				}
			}
		})
		// 请求拿到总章节_________________________________----------------------------------------------------->
		let count=0
		let start=1
		// 每100个进行分割
		// 拿到循环次数
		if(Number.isInteger(this.total_p.count/100)){
			count=this.total_p.count/100
			// 是整数
			for(let i=0;i<count;i++){
				this.total_passage.push({
					start:start,
					end:start+100
				})
				start+=100
			}
		}else{
			count=Number.parseInt(this.total_p.count/100)+1
			// 不是整数
			for(let i=0;i<count;i++){
				// 最后一次循环
				if(i==count-1){
					this.total_passage.push({
						start:start,
						end:this.total_p.count
					})
					break
				}
				this.total_passage.push({
					start:start,
					end:start+100
				})
				start+=100
			}
		}
		
	},
	methods:{
		scroll_change: function(e) {
			return
			// 做记录章节滚动的还原
			clearInterval(this.timer)
				// 解决view层不同步的问题
				// console.log(this.scrollTop);
				this.timer=setTimeout(()=>{
					this.scrollTop = e.detail.scrollTop
				},500)
			}
	},
	props:['passage_height','total_p','directory_list','toggle_passage','book_name','window_height','background_color']
}
</script>

<style scoped lang="less">
	.container{
		box-shadow:0 -4px 10px -3px gray;
		display: flex;flex-direction: column;
		text-align: start;
		padding:20px 20px 20px 20px;
		&>view{
			flex-grow: 1;
		}
		box-sizing: border-box;
	}
	.select{
		width:100%;
		max-height:40px;
		display: flex;
		&>view{
			text-align: center;
			flex-grow: 1;
		}
	}
	.passages_title{
			padding:0 10px 0 10px;
			box-sizing: border-box;
			width:100%;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			&:active{
				color:black;
				background-color:rgba(0,0,0,.1);
			}
	}
	.passages{
		padding:0 3px;
		box-sizing: border-box;
		margin-top:10px;
		flex-grow: 1;
		font-size:18px;
		box-sizing: border-box;
		overflow:hidden;
		display: flex;
		flex-direction: column;
	}
	
</style>