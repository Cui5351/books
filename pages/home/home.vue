<template>
	<link rel="preload" href="AaWangCaiZhaoPaiTi.woff2" as="font" type="font/woff2" crossorigin>
	<!-- head高度：100rpx -->
		<navigation-header  :book_wh="goods_category/4" :head_height='header_height*0.4' :head_height_child='head_height_child' :state='header_state'></navigation-header>
		<view @click.stop="goto1" class="gotoback" :style="{left:left_distance+'%'}">
			<image src="https://www.mynameisczy.asia/rabbit/arrow_top.svg" style="width:30px;height: 50px;"></image>
		</view>
		<uni-popup ref="popup" background-color="#fff">
			<view class="popup-content" >
				<text>简介</text>
				<text>{{content}}</text>
			</view>
		</uni-popup>
	<scroll-view class="container" scroll-y='true' scroll-with-animation='true' :style="{minHeight:container-70+'px',marginTop:head_height_child*1.4+'px'}" @scrolltolower='scroll_fun2' @scroll='scroll_fun' :scroll-top="scroll_top">
		<view class="header" :style="{minHeight:header_height+'rpx',maxHeight:header_height+'rpx'}">
			<search head_width='100' :book_wh="goods_category/4" style="flex-grow: 1;" :head_height_child="head_height_child" :head_height='header_height*0.4'></search>
		</view>
		<view class="goods_category" :style="{minHeight:goods_category+'rpx',maxHeight:goods_category+'rpx'}">
			<swiper class="list" autoplay indicator-dots circular interval="2000" previous-margin="40px" next-margin="40px">
				<swiper-item v-for="a in 8" :key='a' @click.stop="toggle_wallpaper_page" style="max-height: 100%;min-height:100%;display: flex;justify-content: center;align-items: center">
					<image :src="'http://mynameisczy.asia/play_loop/'+a+'.jpg'" mode='aspectFill'  lazy-load="true"></image>
				</swiper-item>
			</swiper>
			<!-- <view class="advertisement" :style="{minHeight:fixed+'rpx',maxHeight:fixed+'rpx'}"> -->
<uni-notice-bar show-icon scrollable style="width: 100%;"
		
				text="小 程 序 2.0 终 于 跟 大 家 见 面 啦 ! 大 家 若 在 使 用 小 程 序 中 途 遇 到 问 题 ,  可 以 在 我的 -> 小程序 反 馈 进 行 反 馈 哟 !" />
			<!-- </view> -->
		</view>
		<view class="fixed" :style="{minHeight:fixed+'rpx',maxHeight:fixed+'rpx'}">
			<scroll-view scroll-x="true" class="other">
				<view type="default" @click.stop="category_list(a)" v-for="a in list_btn" :key='a' :style="{minHeight:fixed*0.7+'rpx',lineHeight:fixed*0.7+'rpx',backgroundColor: 'white',display: 'inline-block',width:info.windowWidth/4+'px', marginRight:10+'px',borderRadius:10+'px',textAlign: 'center',color:'rgb(77,78,79)'}">{{a}}
				</view>
			</scroll-view>
			<view class="flex_config" style="min-width:30px;">
			<uni-icons type="bars" size="25"></uni-icons>
			</view>
		</view>
		<view class="bill" v-if='to_hid!==1'>
			<view v-for="(item,index) in to_hid!=1?10:0" :key="index" style="justify-content: center;height:80px;display: flex;margin-top: 10px;background-color: white;" @click="show_dog_info(item)">
				<view style="width:70px;height:70px;">
					<image :src="'https://www.mynameisczy.asia/dog_collection/'+'dog'+item+'.jpeg'" style="width: 100%;height: 100%;"></image>
				</view>
				<view style="display: flex;flex-grow: 1;justify-content: center;align-items: center;">查看狗子{{item}}的介绍</view>
			</view>
		</view>
		<view class="bill" :style="{height:bill_height+'rpx'}" v-if='to_hid==1'>
			<view class="store_infos" :style="{height:goods_category/4+50+'px'}" v-for="(item,index) in store_infos" :key="index"  >
				<view  @click.stop="toggle(item)" :style="{maxWidth:goods_category/4+'px',minWidth:goods_category/4+'px',maxHeight:goods_category/3.5+'px',minHeight:goods_category/3.5+'px'}">
					<image :src="'https://www.mynameisczy.asia/image/'+item.book_name+'.jpg'" :style="{maxWidth:goods_category/5+'px',minWidth:goods_category/5+'px',maxHeight:goods_category/4+'px',minHeight:goods_category/4+'px'}"></image>
				</view>
				<view class="title" :style="{maxHeight:goods_category/3.5+'px',minHeight:goods_category/3.5+'px'}">
					<view style="font-weight:bold;font-size:17px;display: flex;justify-content: space-between;">
						{{item.book_name}}
						<uni-fav class="favBtn" :checked='item.fav' circle="true" bgColorChecked="#dd524d" @click.stop="fav_book(item)"/>
					</view>
					<view style="color:gray;font-size:13px;" @click.stop="request_book_info(item)" >
						<!-- <view style="display: inline-block;font-size:16px;color: red;">{{item.score}}分</view> -->
						<text decode>
							作者: {{item.author}}
						</text>
						<view style="display: flex;flex-direction:column;vertical-align: center;" >
							<text decode style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
								总章节: {{item.passage_count}}&emsp;
								类型: {{item.book_type}}
							</text>
							<view style="display: flex;flex-direction:row;justify-content: space-between;vertical-align: center;">
								<text>
									小说情况：{{item.book_state}}
								</text>
								<text decode style="display: block;font-size:16px;color: red;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
									进入
								</text>
							</view>
						</view>
						<!-- 再写一个简介（多余的使用省略好） -->
					</view>
				</view>
			</view>
			<view class="bottom">{{refresh_info}}
			<uni-icons :type="refresh_state_info"></uni-icons>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	//可按需导入
	import navigationHeader from '../../components/book_search/navigation.vue'
	import search from '../../components/book_search/search.vue'
	import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/popup.js'
	import {ref,reactive,onMounted,computed,toRefs,watch} from 'vue'
	import {useStore} from 'vuex'
	export default {
		name:'home',
		components:{
			navigationHeader,search,uniPopup
		},
		onShareAppMessage(res) {
		    return {
		        title: '源暮书城', //分享的名称
		        path: '/pages/home/home',
		        // mpId:'' //此处配置微信小程序的AppId
		    }
		},
		//分享到朋友圈
		onShareTimeline(res) {
		    return {
		        title: '源暮书城',
		        type: 0,
		    }
		},
		mounted() {
			uni.current_this2=this
			uni.request({
				url:'https://www.mynameisczy.asia:5000/small_program_state',
				method:'POST',
				data:{
					small_program_name:'book_small_program'
				},success(value) {
					if(value.data.value==0){
						uni.reLaunch({
							url:'/pages/service_stop_page/service_stop_page',
						})
					}else if(value.data.value==2){
						uni.current_this2.to_hid=2
						return
					}
				},fail(e) {
					// 加载失败
					if(!value.data.value){
						uni.reLaunch({
							url:'/pages/service_stop_page/service_stop_page',
							fail(e) {
								console.log('fail',e)
							}
						})
					}
				}
			})
			uni.showLoading({
				title:'数据加载中'
			})			
			uni.request({
				method:'POST',
				url:'https://www.mynameisczy.asia:5351/getCategory',
				success(value) {
					let arr=value.data.value.map(item=>item.book_type)
					uni.current_this2.list_btn.push(...arr)
				},fail() {
					uni.current_this2.list_btn.push(...['语文','数学','英语','计算机基础','c语言','计算机网络基础'])
				}
			})
			// list_btn.push()
			const store=useStore()
			// 查看用户是否登录
			if(store.getters.login_state){
				this.getBookList()
				uni.hideLoading()
				uni.showToast({
					icon:'none',
					title:'bug时常有,工作人员正快马加鞭修复中ing',
					duration:2000
				})
			}else{
				this.getBookList()
				uni.hideLoading()
				uni.showToast({
					icon:'none',
					title:'bug常有,小编正快马加鞭修复中ing',
					duration:2000
				})
			}
			// 拿到用户的收藏(后会触发watch的监听)
			if(store.getters.login_state){
				store.dispatch("getBookshelf")
			}
		},
		methods:{
			toggle(item){ 
				if(this.load_state)
					return
				this.content=item.book_introduce
				this.$refs.popup.open()
			},
			goto1(){
				console.log('goto');
				this.scroll_top = this.old.scrollTop
				this.left_distance=150
				this.$nextTick(function() {
					this.scroll_top = -20
				});				
			},
			// 下拉到一定距离时触发
			scroll_fun(event){
				this.old.scrollTop = event.detail.scrollTop
				if(event.target.scrollTop>=this.header_height-50){
						this.header_state=false
						if(event.target.scrollTop>=this.header_height+300)
							this.left_distance=95
				}else{
					this.left_distance=150
					this.header_state=true
				}
			}
		},
		setup(){
			let left_distance=ref(150)
			let scroll_top=ref()
			let content=ref('')
			let old=reactive({
				scrollTop:0
			})
			let to_hid=ref(1)
			let load_state=ref(0)
			const store=useStore()
			let skip=ref(0)
			let store_infos=reactive([])
			let refresh_state_info=ref('pulldown')
			
			// 解决取消书架里的书后首页数据不会响应store_infos
			let bookshelf=computed(()=>{
				let fav=store.getters.fav_book
				// 给store_infos进行判断(若存在)
				return fav
			})
			
			watch(bookshelf,function(n){
				// n:新的bookshelf
				// store_infos:页面展示的
				
				// 先将所有的赋空
				store_infos.forEach(item=>{
					item.fav=false
				})
				// 再获取到新的bookshelf
				store_infos.forEach(item=>{
					n.forEach(item2=>{
						if(item.book_name==item2){
							item.fav=true
						}
					})
				})
			})
			
			let refresh_info=ref('上拉显示更多')
			
		function getBookList(){
			if(this.to_hid.value==2){
				return
			}
			if(skip.value>=50){
				uni.current_this2.refresh_info="已经加载不了更多了"
				uni.current_this2.refresh_state_info=''
				return
			}
			uni.showLoading({
				title:'书籍加载中'
			})
			load_state.value=1
			this.refresh_info="正在加载过程中"
			this.refresh_state_info='spinner-cycle'
			uni.request({
				url:'https://www.mynameisczy.asia:5351/getBookInfo',
				method:'POST',
				data:{
					skip:skip.value,
					count:10
				},success(value) {
					
					if(value.data.value.length>0){
						// 拿到用户的收藏
						// 对value.data.value进行遍历（添加一个收藏的属性）
						
						value.data.value.forEach(item=>{
							item.fav=false
						})
						// 如果找到相同的那么设置为true
						value.data.value=value.data.value.map(item=>{
							uni.current_this2.bookshelf.forEach(item2=>{
								if(item.book_name==item2)
									item.fav=true
							})
							return item
						})
						// 跟用户的收藏进行匹配
							// 匹配到：将其属性设置为true
							// 没匹配到的：将其属性设置为false
						
						uni.current_this2.store_infos.push(...value.data.value)
						if(value.data.value.length>=10){
							uni.current_this2.skip+=10
							uni.current_this2.request_data(10)
						}
						else if(value.data.value.length>=3){
							uni.current_this2.skip+=3
							uni.current_this2.request_data(3)
						}
						else if(value.data.value.length>=2){
							uni.current_this2.skip+=2
							uni.current_this2.request_data(2)
						}
						else if(value.data.value.length>=1){
							uni.current_this2.skip+=1
							uni.current_this2.request_data(1)
						}
					}else{
						uni.current_this2.refresh_info="已经加载不了更多了"
						uni.current_this2.refresh_state_info=''
					}
				},fail(e) {
					uni.current_this2.to_hid=0
					uni.hideLoading()
					load_state.value=0
					uni.current_this2.refresh_info=e
					uni.current_this2.refresh_state_info="close"
				}
			})
		}
			function request_book_info(book){
				uni.showLoading({
					title:'书籍加载中'
				})
				if(store.getters.login_state<=0){
					uni.showToast({
						icon:'error',
						title:'请先登录'
					})
					return
				}
				// 当数据存在，那么就跳过
				uni.getStorage({key:book.book_name}).then(()=>{
					uni.navigateTo({
						url:"/pages/current_book_page/current_book_page?book_name="+book.book_name+'&passage_count='+book.passage_count,
						animationType:'slide-in-right'
					})
				}).catch(e=>{
					uni.request({
						url:'https://www.mynameisczy.asia:5351/getBookPassage',
						method:'POST',
						data:{
							book_name:book.book_name,
							skip:0,
							count:10
						},
						success(value) {
							uni.hideLoading()
							if(value.data.value.length<=0){
								uni.showToast({
									title:"该书籍暂时还未上架",
									icon:'none'
								})
								return
							}
							// 将数据进行存储	
							uni.setStorage({
								key:book.book_name,
								data:[{
									index:value.data.value[0].passage_value,
									passage:value.data.value
								}]
							})
							uni.navigateTo({
								url:"/pages/current_book_page/current_book_page?book_name="+book.book_name+'&passage_count='+book.passage_count
							})
						},fail(e){
							uni.hideLoading()
							uni.current_this2.refresh_info=e
							uni.current_this2.refresh_state_info="close"
						}
					})
				})
			}
			
			// 下拉触底
			function scroll_fun2(event){
				if(refresh_state.value){
					refresh_state.value=false
					this.getBookList()
				}
			}
			// 增加数据（网络请求）
			function request_data(val){
				bill_height.value+=(((goods_category.value/4)+140)*val)
				uni.current_this2.refresh_state=true
				uni.current_this2.refresh_info="数据加载完成"
				uni.current_this2.refresh_state_info='checkbox'
				setTimeout(()=>{
					load_state.value=0
					console.log('加载完成')
				},1500)
				uni.hideLoading()
			}
			let refresh_state=ref(true)
			let header_state=ref(true)
			let title=ref('hello')
			let info=reactive(uni.getSystemInfoSync())
			
			let container=ref(info.windowHeight);
			let header_height=ref(info.windowHeight/7)
			let goods_category=ref(info.screenHeight/1.6)
			// 每获取一次数据，然后就让其增加
			let bill_height=ref(0)
			let list_btn=reactive([])
			let fixed=ref(header_height.value*0.9)
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			
			function no_develop(){
				uni.showToast({
					icon:'none',
					title:'此功能暂时未开放'
				})
			}
			function toggle_wallpaper_page(){
				uni.navigateTo({
					url:"/pages/wallpaper/wallpaper"
				});
			}
				function fav_book(book){
					console.log('收藏',book.book_name)
					// 等加载
					if(load_state.value){
						console.log('wait load');
						return
					}
					if(store.getters.login_state)
						store.dispatch("fav_book",book)
					else
						uni.showToast({
							icon:'error',
							title:'请先登录'
						})
				}
				
				function category_list(item){
					if(to_hid.value==0){
						uni.showToast({
							title:"同学,要加油哦！"
						})
						return
					}
					uni.navigateTo({
						url:'/pages/category_book/category_book?title='+item+'&book_wh='+goods_category.value/4
					})
				}
			function show_dog_info(item){
				// uni.showToast({
					// title:'这是狗子'+item+',嗷嗷嗷',
					// icon:'none'
				// })
				let arr=['柴犬是体型中等并且又最古老的日本犬。柴犬能够应付陡峭的丘陵和山脉的斜坡，拥有灵敏的感官','它们是非常古老的犬种,基因和狼非常相近,相貌也酷似狼,','西伯利亚雪橇犬是原始的古老犬种,主要生活在在西伯利亚东北部、格陵兰南部。哈士奇名字是源自其独特的嘶哑叫声。','外貌：脚步轻快自如，动作优美。犬身适度紧凑，毛量丰，竖耳，尾如毛刷，其典型步态特征为平稳、轻松','性情:友好、温和但不失机警,性格开朗。既不会表现出护卫犬的强烈占有欲,也不会对陌生人产生过度怀疑或攻击其它犬只']
				uni.current_this2.toggle({book_introduce:'这是狗子'+item+'号'+arr[Math.round(Math.random()*5)]})
			}
			return {...toRefs(store.state),toggle_wallpaper_page,show_dog_info,to_hid,load_state,left_distance,old,scroll_top,content,category_list,getBookList,no_develop,bookshelf,fav_book,request_book_info,refresh_info,refresh_state,refresh_state_info,title,header_state,bill_height,skip,scroll_fun2,header_height,goods_category,container,fixed,head_height_child,info,request_data,list_btn,info,store_infos}
		}
	}
</script>

<style lang="less" scoped>
@import url('@/general.less');
	.gotoback{
		display:flex;
		flex-direction:column;
		justify-content:center;
		align-items:center;
		position: absolute;
		top:80%;
		z-index:999;
		transition: 0.5s ease;
		transform: translateX(-100%);
		border-radius:10px;
		font-weight:bold;
	}
	.popup-content{
		box-sizing: border-box;
		padding:20px;
		&>text:first-child{
			margin-bottom:15px;
			font-weight:bold;
		}
		&>text{
			text-align: center;
			display: block;
			font-size:20px;
		}
	}
	#head{
		margin-top:0px;
	}
	.flex_config{
		display:flex;
		justify-content: center;
		align-items: center;
	}
	.container {
		margin-top:0;
		font-size: 14px;
		transition: 0.5s ease;		
		box-sizing: border-box;
		line-height: 24px;
		width:100%;
		display:flex;
		height:300px;
		flex-direction: column;
		.header,.bill,.goods_category,.fixed{
			padding: 0px 15px 20px 15px;
			box-sizing: border-box;
			flex-grow: 1;
			margin:10rpx 0;
		}
		.header{
				margin-top:0;
				padding:0;
				background-color: white;
				border-top-right-radius:30px;
				border-top-left-radius:30px;
				display: flex;
				justify-content: center;
				align-items: center;
		}
		.payment:active{
			background: @background;
			color:white;
		}
		.bill{
			padding-bottom:0;
			display: flex;
			flex-direction: column;
			&>.bottom{
				height:30px;
				display: flex;
				justify-content: center;
				align-items: center;
				width:100%;
				color:gray;
			}
			&>.store_infos{
				margin:5px 0;
				&:active{
					background-color: rgba(0,0,0,.1);
				}
				.title{
					justify-content: space-around;
					display: flex;
					flex-direction: column;
				}
				&>view{
					flex-grow: 1;
					padding:10px 10px;
					box-sizing: border-box;
				}
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: white;	
			}
		}
		.goods_category{
			background-color: rgb(250,250,250);
			display: flex;
			padding-bottom:0;
			flex-direction: column;
			justify-content: space-between;
			&>.advertisement{
				display:flex;
				justify-content: space-between;
				align-items: center;
				padding:0 10px;
				box-sizing: border-box;
				&>view{
					flex-grow:1;
					height:100%;
				}
				&>view:nth-child(1){
					display: flex;
					height:100%;
					align-items: center;
					&>view{
						min-height:100%;
						max-height:100%;
					}
					&>view:nth-child(1){
						margin-right:10rpx;
					}
				}
				&>view:nth-child(2){
					border:1px solid orange;
					color:orange;
					text-align: center;
					border-radius:10rpx;
				}
			}
			&>view{
				flex-grow: 1;
			}
			&>.list{
				display: flex;
				// column-count: 5;
				// flex-wrap: wrap;
				margin-bottom:10px;
				flex-grow: 1;
				&>view{
					&:active{
						border:1px solid yellowgreen;
					}
					width:20%;
					border:1px solid rgba(0,0,0,0.1);
					box-sizing: border-box;
				}
			}
				&>view:nth-child(2){
					background-color: white;
					border-radius:10px;
				}
		}
	.fixed{
		position: sticky;
		margin-top:0px;
		margin-bottom:0px;
		top:0px;
		padding-top:0;
		padding-bottom:0;
		display: flex;
		justify-content: space-around;
		&>.other{
				&>view:active{
					background-color: rgba(0,0,0,.1);
			}
			padding:0;
			white-space: nowrap;
			width:100%;
			max-height:75%;
			min-height:75%;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
	}
</style>