<template>
		<view class="container" :style="{width:(container_height)+'px',height:container_width+'px'}">
			<view class='head'>
					<view>退出</view>
				<view>12</view>
			</view>
			<view class="others">
				<view v-for="(item,index) in 2" :key="index">
					<view class="user">
						<view class="avatar">
							<image style="height: 100%;width:100%;" src='../../static/back_img/back1.jpg' mode=""></image>
						</view>
						<view class="name">najkjkjlkjlkjlkme</view>
						<view class="count">牌:count</view>
						<view class="master">master</view>
						</view>
					<view class="person_cards">
						cards
					</view>
				</view>
					<view class="btns">
						<view class="btn2">叫地主</view>
						<view class="btn">不抢</view>
					</view>
<!-- 				<view class="person2">
					<view class="user">
						<view class="avatar">
							<image style="height: 100%;width:100%;" src='../../static/back_img/back1.jpg' mode=""></image>
						</view>
						<view class="name">name</view>
						<view class="count">count</view>
						<view class="master">master</view>
						</view>
				</view> -->
			</view>
			<view class="cards">
				<view class="card" v-for="(item,index) in 17" :key="index">
					1
				</view>
			</view>
			<view class="myself">
				<view class="user2">
					<view class="avatar">
						<image style="height: 100%;width:100%;" src='../../static/back_img/back1.jpg' mode=""></image>
					</view>
					<view class="my_name">nagawejlifwajlkzzme</view>
					<view class="my_count">牌:count</view>
				</view>
				<view class="chat">
					<view>
						<view class="bei1">
						倍
						</view>
					<view class="bei">
						60
					</view>
					</view>
					<view class="chat2">聊天</view>
				</view>
			</view>
		</view>
</template>

<script>
	import {reactive,ref} from 'vue'
	export default {
		setup() {
			let head_height_child=ref(uni.getMenuButtonBoundingClientRect().height*1.7)
			let container_height=ref(uni.getSystemInfoSync().windowHeight)
			let container_width=ref(uni.getSystemInfoSync().windowWidth)
			
			return {head_height_child,container_height,container_width}
		}
	}
</script>
<style scoped lang="less">
@import url('/general.less');
      /*竖屏样式*/
      .container {
		  position: absolute;
		  /* top:0%; */
		  display: flex;
		  flex-direction: column;
        transform-origin: 0 0;
		/* background-color:red; */
        // transform: rotateZ(90deg) translateY(-100%);
		&>view{
			flex-grow: 1;
			background-color: red;
			border-bottom:5px solid white;
			box-sizing: border-box;
		}
		.myself{
			padding: 0 20px;
			box-sizing: border-box;
			max-height:50px;
			display: flex;
			justify-content: space-between;
			.chat{
				display: flex;
				justify-content: center;
				align-items: center;
				&>view{
					// width:50px;
					display: flex;
					height:60%;
				}
				.chat2{
					background-color: yellowgreen;
					padding:10px;
					box-sizing: border-box;
					display: flex;
					justify-content: center;
					align-items: center;
					border-radius:10px;
				}
				.bei1{
					height:30px;
					width:30px;
					text-align: center;
					line-height: 30px;
					background-color: skyblue;
					border-radius: 50%;
					position: relative;
					z-index: 2;
				}
				.bei{
					transform: translateX(-10%);
					border-top-right-radius: 10px;
					border-bottom-right-radius: 10px;
					width:80px;
					text-align: center;
					background-color: rgba(0,0,0,.1);
				}
			}
			&>.user2{
				display: flex;
				justify-content: center;
				align-items: center;
				.avatar{
					max-height:70px;
					max-width:70px;
					min-height:70px;
					min-width:70px;
					width:70px;
					height:70px;
					&>image{
						transform: translateY(-30%);
						border-radius:50%;
						position: relative;
						z-index:2;
						border: 5px solid white;
						box-sizing: border-box;
						background-color: white;
					}
				}
				.my_name{
					background-color: rgba(0,0,0,.1);
					height:60%;
					// width:70px;
					padding:0 10px 0 50px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					max-width:150px;
					color: white;
					box-sizing: border-box;
					transform: translateX(-30%);
				}
			}
			&>view{
				display: flex;
			}
		}
		.btns{
			max-height:40px;
		}
		.others{
			padding-top:5%;
			display: flex;
			padding: 5% 10px 0 10px;
			justify-content: space-between;
			align-items: center;
			height:30%;
			.btns{
				position: absolute;
				width:150px;
				left:50%;
				top:50%;
				display: flex;
				justify-content: space-between;
				&>view{
					max-width:40%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				transform: translate(-50%,-50%);
			}
			&>view{
				height:100%;
				width:35%;
				.person_cards{
					background-color: yellow;
				}
				display: flex;
				&>view{
					flex-grow: 1;
				}
			}
			&>view:nth-child(2){
				flex-direction: row-reverse;
			}
		}
		.cards{
			display: flex;
			padding:0 20px;
			&>view{
				display: flex;
				justify-content: center;
				font-size: 20px;
				font-weight: bold;
				flex-grow: 1;
				background-color: white;
				border: 5px solid orangered;
				box-sizing: border-box;
			}
		}
		.head{
			display: flex;	
			align-items: center;
			justify-content: space-between;
			padding:0 130px 0 30px;
			max-height:40px;
			&>view{
				border: 1px solid white;
				border-radius: 10px;
				// width:30px;
				padding:0 5px;
				height:30px;
				line-height: 30px;
				text-align: center;
			}
		}
    }
	.user{
		max-width:30%;
		&>view{
			margin-top:5px;
		}
		.avatar{
			max-height:70px;
			max-width:70px;
			min-height:70px;
			min-width:70px;
			width:70px;
			height:70px;
			&>image{
				border: 5px solid white;
				box-sizing: border-box;
				background-color: white;
				border-radius:50%;
			}
		}
		.name{
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width:100px;
			color: white;
			max-height:30px;
			background-color: red;
		}
		&>view{
			text-align: center;
			flex-grow: 1;
		}
	}
</style>
