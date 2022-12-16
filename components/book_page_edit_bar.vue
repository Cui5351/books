<template>
	<view class="container" :style="{height:window_height*0.15+'px',top:show_e==1?100+'%':200+'%',background:background_color.color?'rgb(241,229,201)':'#1A1A1A',color:background_color.color?'black':'white'}">
		<!-- <view class="book_name" :style="{minHeight:30+'px'}"> -->
			<!-- {{book_name}} -->
		<!-- </view> -->
<!-- props:['passage_height','directory_list','toggle_passage','request_tolower'] -->
		<!-- 做一个下拉 -->
<!-- 		<scroll-view class="passages" @scroll="scroll_change" :scroll-top="scroll_top" :style="{maxHeight:passage_height*7+'px',minHeight:passage_height*7+'px'}" scroll-y="true" @scrolltolower="request_tolower">
			<view class="passages_title" :style="{minHeight:passage_height+'px',maxHeight:passage_height+'px',lineHeight:passage_height+'px'}" v-for="(item,index) in directory_list" :key="index" @click="toggle_passage(item)">
				{{item.passage_name}}
			</view>
		</scroll-view> -->
			<view class="toggle_passage">
				<!-- transform:`translateY(${choose!==0?'-100%':'100%'})`, -->
				<view class="copmonent" :style="{background:background_color.color?'rgb(241,229,201)':'#1A1A1A',color:background_color.color?'black':'white'}">
					<book_directory :total_p='total_passage' :background_color='background_color' v-show='choose==1' :window_height="window_height" :book_name='book_name' :passage_height="passage_height" :directory_list="directory_list" :toggle_passage='toggle_passage'></book_directory>
					<book_setup :font_size='font_size' :slider_change='slider_change' :passage_height='passage_height' v-show="choose==2"></book_setup>
				</view>
				<view @click="set_index(-1)" v-show='choose==0'>上一章</view>
				<view @click="set_index(1)" v-show='choose==0'>下一章</view>
			</view>
			<view class="choose">
				<view @click="show_choose(1)">目录</view>
				<view @click="toggle_background">{{background_color.color?'黑夜':'白天'}}</view>
				<view @click="show_choose(2)" >设置</view>
			</view>
			
<!-- 			<view class="color">
				<view>
					主题:
				</view>
				<view>
					<view style="background-color: red;height:30px;width:30px;"></view>
					<view style="background-color: yellow;height:30px;width:30px;"></view>
					<view style="background-color: green;height:30px;width:30px;"></view>
				</view>
			</view> -->
		</view>
</template>

<script>
	import {reactive,watch,ref} from 'vue'
	import book_directory from './book_tools/book_directory.vue'
	import book_setup from './book_tools/book_setup.vue'
	export default {
		name:"book_page_edit_bar",
		components:{
			book_directory,book_setup
		},
		props:['show_e','total_passage',"current_book","book_storage_array","book_name",'toggle_passage','set_index','font_size','background_color'],
		mounted() {
			uni.current_this=this
			// 查看本地目录
			uni.getStorage({
				key:this.book_name+'_directory',
				success(value){
					uni.current_this.directory_list.push(...value.data)
				// 查看本地index
					uni.getStorage({key:uni.current_this.book_name+'_passage_value',success(value){
						uni.current_this.current_book.passage_value=value.data
						uni.current_this.toggle_passage(uni.current_this.current_book)
					},fail(e){
						uni.current_this.current_book.passage_value=1
						uni.current_this.toggle_passage(uni.current_this.current_book);
					}})
				},
				fail(e) {
					// 请求拿到目录
					uni.request({
						url:"https://www.mynameisczy.asia:5351/getBookDirectory",
						method:"POST",
						data:{
							book_name:uni.current_this.book_name,
							skip:0,
							count:100
						}
					}).then(value=>{
						console.log('拿到第一个作为索引',uni.current_this.total_passage);
						uni.current_this.directory_list.push({
							index:value.data.value[0].passage_value,
							passage:[...value.data.value]
						})
						uni.setStorage({
							key:uni.current_this.book_name+'_directory',
							data:uni.current_this.directory_list
						})
					}).catch(e=>{
						console.log(e)
					})
				}
			})
			
		},
		beforeUnmount() {

		},
		setup(props){
			let choose=ref(0)
			let index_text=ref('')
			const window_height=uni.getSystemInfoSync().windowHeight
			let passage_height=uni.getMenuButtonBoundingClientRect().height*1.2
			let directory_list=reactive([])
			let search_state=ref(1)
			let skip=ref(0)
			let ord_index=ref(0)
			
			// 触底增加数据
			function request_tolower1(){
				uni.showLoading({
					title:'加载中'
				})
				uni.request({
						url:"https://www.mynameisczy.asia:5351/getBookDirectory",
						method:"POST",
						data:{
							book_name:props.book_name,
							skip:skip.value,
							count:100
						},success(value){
							// 章节名value
							uni.current_this.search_state=1
							if(value.data.value.length>0){
								// 查看章节值是否包含
								for(let item of uni.current_this.book_directory){
									if(vlaue.data.value[0].passage_value==item.index){
										// 找到了(不存在后续的保存工作)
										return
									}
									
								}
								value.data.value[0].passage_value
								// 将章节名缓存
								uni.setStorage({
									key:uni.current_this.book_name+'_directory',
									data:directory_list
								})
						}
						uni.hideLoading()
								
					},fail(e) {
						uni.current_this.search_state=1
						console.log(e)
						uni.skip-=100
					},
					})
					skip.value=skip.value+100
			}
				
			function slider_change(e){
				props.font_size.size=e.detail.value
			}
			watch(()=>props.show_e,function(n,o){
				if(n==0){
					choose.value=0
				}
			})
			function show_choose(e){
				if(e==choose.value){
					choose.value=0
					return
				}
				choose.value=e
			}
			function toggle_background(){
				props.background_color.color=props.background_color.color?0:1
			}
			
			return {show_choose,choose,toggle_background,slider_change,skip,window_height,index_text,ord_index,search_state,passage_height,directory_list}
		}
	}
</script>

<style lang="less">
.container{
	// box-shadow:0 -4px 10px -3px gray;
	position: fixed;
	margin-top:0;
	z-index:1000000;
	padding: 10px 15px 10px 15px;
	box-sizing: border-box;
	width:100%;
	// left:-100%;
	display: flex;
	flex-direction: column;
	justify-content:space-between;
	top:200%;
	border-top-right-radius:10px;
	border-bottom-right-radius:10px;
	transition:0.3s ease;
	transform: translateY(-100%);
	color:white;
	&>.showComponent{
		position:absolute;
		width:100%;
		top:-100%;
		height:200px;
		background-color: red;
	}
	&>.choose{
		display: flex;
		max-height:50%;
		min-height:50%;
		&>view{
			flex-grow: 1;
			text-align:center;
		}
	}
	&>view{
		flex-grow: 1;
	}
	margin:10px 0;
	&>.font_size{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		&>view{
			display: flex;
			max-height:50%;
			min-height:50%;
			flex-grow: 1;
			&>.searchBtn{
				&:active{
					color: black;
				}
			}
		}
	}
	flex-grow: 1;
	.toggle_passage{
		max-height:30%;
		min-height:30%;
		display: flex;
		padding:6px;
		box-sizing: border-box;
		justify-content: space-around;
		align-items: center;
		position: relative;
		&>.copmonent{
			transition: 1s ease;
			position: absolute;
			width:100%;
			top:0;
			transform: translateY(-100%);
		}
		&>view{
			&:active{
				// color:gray
			}
			text-align: center;
			flex-grow: 1;
		}
	}
	.color{
		display: flex;
		justify-content: space-around;
		align-items: center;
		&>view{
			flex-grow: 1;
			border-radius: 50%;
			display: flex;
			text-align: center;
			justify-content: center;
			align-items: center;
		}
	}
	&>.book_name{
		font-weight: bold;
		text-align: center;
		font-size:20px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	&>.passages{
		padding:0 3px;
		box-sizing: border-box;
		margin-top:10px;
		flex-grow: 1;
		font-size:18px;
		border:1px solid black;
		box-sizing: border-box;
		overflow:hidden;
		display: flex;
		flex-direction: column;
	}
	&>.setup{
	}
}
</style>