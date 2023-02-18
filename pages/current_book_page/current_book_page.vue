<template>
	<books-page-navigation :show_e='show_e' :head_height_child="head_height_child" :current_book_passage_name="current_book.passage_name"
		:book_storage_array="book_storage_array" :color="background_color"></books-page-navigation>
	<book_page_edit_bar :total_passage='total_passage' :background_color="background_color" :font_size="font_size"
		:toggle_passage="toggle_passage" :set_index="set_index" :show_e="show_e" :current_book="current_book"
		:goTop="goTop" :book_storage_array="book_storage_array" :book_name="book_name"></book_page_edit_bar>
	<scroll-view @touchend="touchend" @touchstart='touchstart' @touchmove='touch'
		:style="{background:background_color.color?'rgb(241,229,201)':'#1A1A1A',color:background_color.color?'black':' #B1B1B1'}"
		scroll-y="true" :scroll-top="scrollTop" @scroll="scroll" class="container" @click="hidden_header_bar">
		<!-- <text v-for="(item,index) in book_storage_array" :key="index">{{item.content}}</text> -->
		<!-- <text>{{book_storage_array}}</text> -->
		<!-- <image src="https://www.mynameisczy.asia/rabbit/book_back.png" style="height:100%;width: 100%;position: absolute;z-index: -1;" mode=""></image> -->
		<view class="passage_name"
			:style="{marginTop:head_height_child+'px',marginBottom:head_height_child+'px',lineHeight:50+'px',fontSize:35+'px'}">
			{{current_book.passage_name}}
		</view>
		<view class="passage_content">
			<bookpage :font_size='font_size' :current_book='current_book'></bookpage>
			<view class="toggle_btn" style="font-size:20px;text-align: center;color:gray"
				v-if="current_book.passage_name.length?1:0">
				左右滑动可以进行翻页
			</view>
		</view>

		<!-- 功能:记录当前浏览的index,下次直接跳转至 -->
	</scroll-view>
</template>

<script>
	// import font_size from '../../static/json/font_set.js'
	import {
		reactive,
		ref,
		onMounted
	} from 'vue'
	import bookpage from './book_page.vue'
	import book_page_edit_bar from '../../components/book_page_edit_bar.vue'
	import booksPageNavigation from '../../components/booksPageNavigation.vue'
	export default {
		components: {
			booksPageNavigation,
			book_page_edit_bar,
			bookpage
		},
		name: "current_book_page",
		mounted() {
			uni.current_this7 = this
			uni.request({
				url: 'https://www.mynameisczy.asia:5351/addBookScore',
				data: {
					book_name: this.book_name
				},
				method: 'POST'
			})
			uni.showLoading({
				title: '书籍加载中',
				mask:true
			});
			// 拿到本地书的列表
			uni.getStorage({
				key: this.book_name
			}).then(value => {
				if (value.data.length) {
					uni.current_this7.book_storage_array.push(...value.data)
				for (let item of this.book_storage_array) {
					// 找到这个章节信息，like跳转
					if (uni.current_this7.current_book.passage_value >= item.index && uni.current_this7.current_book.passage_value < (item.index + 100))
						for (let item2 of item.passage) {
								if(item2.passage_value==uni.current_this7.current_book.passage_value){
									uni.current_this7.current_book.content = item2.content
									uni.current_this7.current_book.passage_name = item2.passage_name
									uni.current_this7.current_book.passage_value = item2.passage_value							
									uni.hideLoading()
								}
						}
				}
					// 默认为1
				} else {
					uni.hideLoading()
					uni.current_this7.content = "暂时未开放";
				}
			}).catch(e => {
				uni.hideLoading()
			})
			// 拿到保存的字号和颜色值
			uni.getStorage({
				key: 'background',
				success(e) {
					uni.current_this7.background_color.color = e.data
				}
			})
			uni.getStorage({
				key: 'font-size',
				success(e) {
					uni.current_this7.font_size.size = e.data
				}
			})
			let result = uni.getStorageSync('book_page_scroll' + this.book_name)
			uni.getStorage({
				key: 'book_page_scroll' + this.book_name,
				success(e) {
					uni.current_this7.after_scrollTop = e.data
					if (uni.current_this7.after_scrollTop) {
						setTimeout(() => {
							uni.showToast({
								icon: 'none',
								title: '嗖~',
								duration: 500
							})
							uni.current_this7.goto_after()
						}, 1000)
					}
				}
			})
		},
		beforeUnmount() {
			uni.setStorage({
				key: 'background',
				data: uni.current_this7.background_color.color
			})
			uni.setStorage({
				key: 'font-size',
				data: uni.current_this7.font_size.size
			})
			uni.setStorage({
				key: 'book_page_scroll' + this.book_name,
				data: uni.current_this7.old.scrollTop
			})
		},
		onLoad(option) {
			this.total_passage.count = Number.parseInt(option.passage_count)
			this.book_name = option.book_name
			// 每次进入一本书，都会为其增加分数
		},
		methods: {
			scroll: function(e) {
				if(this.show_e){
					this.show_e = 0
				}
				this.old.scrollTop = e.detail.scrollTop
				if(this.timer2){
					clearTimeout(this.timer2)
					this.timer2=''
				}
				this.timer2=setTimeout(()=>{
					this.scrollTop = this.old.scrollTop
				},500)
			},
			goto_after: function() {
				this.scrollTop = this.old.scrollTop
				this.$nextTick(function() {
					this.scrollTop = this.after_scrollTop
				});
			},
			goTop: function() {
				// 解决view层不同步的问题
				this.scrollTop = this.old.scrollTop
				this.$nextTick(function() {
					this.scrollTop = 0
				});
			},
			//章节信息
			toggle_passage: function(book) {
				uni.showLoading({
					title: '加载中',
				mask:true
				})

				// 检查book_storage_array里是否包含这个数据
				for (let item of this.book_storage_array) {
					// 找到这个章节信息，like跳转
					if (book.passage_value >= item.index && book.passage_value < (item.index + 100))
						for (let item2 of item.passage) {
							if (item2.passage_value == book.passage_value) {
								this.current_book.content = item2.content
								this.current_book.passage_name = item2.passage_name
								this.current_book.passage_value = item2.passage_value
								uni.hideLoading()
								this.saveIndex()
								uni.current_this7.goTop()
								// 找到了直接结束函数
								this.show_e=0
								return
							}
						}
				}
				// 没有找到就进行网络请求
				uni.request({
					url: 'https://www.mynameisczy.asia:5351/getBookInfo_one',
					method: 'POST',
					data: {
						book_name: this.book_name,
						passage_value: book.passage_value
					},
					success(value) {
						uni.hideLoading()
						if(!value.data.value.hasOwnProperty('id')) {
							uni.showToast({
								title: "该书籍暂时还未上架",
								icon: 'none'
							})
							return;
						}
						uni.current_this7.current_book.content = value.data.value.content
						uni.current_this7.current_book.passage_name = value.data.value.passage_name
						uni.current_this7.current_book.passage_value = value.data.value.passage_value
						uni.current_this7.goTop()
						uni.current_this7.saveIndex()
						
						
						// 查看是否需要保存
						// 查看章节位置
						// 当那一个序列存在的时候
						for (let item of uni.current_this7.book_storage_array) {
							// 找到这个章节信息，like跳转
							if (book.passage_value >= item.index && book.passage_value < (item.index + 100)) {
								item.passage.push(value.data.value)
								uni.setStorage({
									key: uni.current_this7.book_name,
									data: uni.current_this7.book_storage_array
								})
								return
									// 找到比其更小的章节
									// console.log(item.value[index],'212');
									// if(item.value[index].passage_value<book.passage_value){
									// 	console.log(value.data.value,'包含');
									// 	item.value.splice(index+1,0,value.data.value)
									// }
								}
							}
						// 当序列不存在，创建序列
						// book.passage.value的
						uni.current_this7.book_storage_array.push({
							index:value.data.value.passage_value-value.data.value.passage_value%100,
							passage:[value.data.value]
						})
						
						
						// console.log('`book_storage',uni.current_this7.book_storage_array);
						// uni.current_this7.book_storage_array.push({
						// 	index: value.data.value[0].passage_value,
						// 	value: value.data.value
						// })
						// 将数据进行存储	
						uni.setStorage({
							key: uni.current_this7.book_name,
							data: uni.current_this7.book_storage_array
						})
					},
					fail(e) {
						uni.hideLoading()
						// 加载失败
						uni.showToast({
							icon: 'error',
							title: '加载失败'
						})
					}
				})
				this.show_e=0
			},
			saveIndex: function() {
				// 每次切换都保存一次索引
				uni.setStorage({
					key: this.book_name + '_passage_value',
					data: this.current_book.passage_value,
				})
			}
		},
		setup() {
			let timer2=ref('')
			let total_passage = reactive({
				count: 0
			})
			let timer=reactive({
				id:0
			})
			let show_e = ref(1)
			let background_color = reactive({
				color: 1
			})
			let font_size = ref({
				size: 25
			})
			let scrollTop = ref(0)
			let old = reactive({
				scrollTop: 0
			})
			let book_name = ref('')
			let after_scrollTop = ref(0)
			let current_book = reactive({
				passage_value: 1,
				passage_name: '',
				content: ''
			})
			let head_height_child = ref(uni.getMenuButtonBoundingClientRect().height * 1.7)
			let height_each = ref(uni.getSystemInfoSync().statusBarHeight * 2)
			let info = reactive(uni.getSystemInfoSync())
			const book_storage_array = reactive([]);
			let hid = ref(true)
			let touch_start = ref(0)

			function hidden_header_bar() {
				show_e.value = show_e.value ? 0 : 1
			}
			
			function set_index(value) {
				if (value != -1) {
					current_book.passage_value += 1
					uni.current_this7.toggle_passage(current_book)
				} else if (current_book.passage_value > 1) {
					current_book.passage_value -= 1
					uni.current_this7.toggle_passage(current_book)
				}
			}
			let touch_state = ref(1)
			let after_touch = ref(0);

			function touch(e) {
				if (!touch_state.value) {
					return
				}
				// console.log(after_touch.value>=e.changedTouches[0].clientX);
				// 向左移动的时候，上次的偏移比这次的要大
				if (after_touch.value > e.changedTouches[0].clientX)
					if (touch_start.value - e.changedTouches[0].clientX >= info.windowWidth / 4) {
						set_index(1)
						// uni.navigateTo({
						// url:'/pages/current_book_page2/current_book_page2'
						// })
						touch_state.value = 0
					}
				if (after_touch.value < e.changedTouches[0].clientX)
					if (e.changedTouches[0].clientX - touch_start.value >= info.windowWidth / 4) {
						set_index(-1)
						touch_state.value = 0
					}
				after_touch.value = e.changedTouches[0].clientX
			}

			function touchstart(e) {
				touch_start.value = e.changedTouches[0].clientX
			}

			function touchend() {
				// 每次触摸后结束	
				clearInterval(timer.id)
				timer.id=0
				touch_state.value = 1
			}


			return {
				after_touch,
				total_passage,
				after_scrollTop,
				touchend,
				touch_state,
				touchstart,
				info,
				touch,
				background_color,
				font_size,
				old,
				book_storage_array,
				scrollTop,
				hidden_header_bar,
				current_book,
				head_height_child,
				show_e,
				book_name,
				set_index,
				timer,
				timer2
			}
		}
	}
</script>

<style lang="less" scoped>
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
		height: 100%;
		transition: 0.8s ease;
		box-sizing: border-box;
		overflow: hidden;

		// background-color: rgb(241,229,201);
		&>.passage_name {
			font-weight: bold;
		}

		&>.passage_content {
			letter-spacing: 5px;

			&>.toggle_btn {
				display: flex;
			}
		}
	}
</style>
