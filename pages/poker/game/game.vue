<template>
	<navigation show_back='1'>进入阶段</navigation>
	<page>
		<view class="container">
			<view class="cards">
				<view class="card" v-for="(item,index) in user_cards" :key="index">
					{{item}}
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	import page from '../../inner_page/inner_page.vue'
	import navigation from '../../navigation/navigation_all.vue'
	import {reactive,ref} from 'vue'
	import {useStore} from 'vuex'
	export default {
		components:{
			navigation,page
		},
		onUnload() {
			this.audio.stop()
		},
		onLoad(res) {
			let cards=JSON.parse(res.cards)
			console.log(cards);
			cards.forEach(item=>{
				setTimeout(()=>{
					console.log(this,'this');
					this.user_cards.push(item)
				},300)
			})
			// this.user_cards.push(...cards)
			this.audio=uni.createInnerAudioContext()
			this.audio.src="https://www.mynameisczy.asia/audio/poker.mp3"
			this.audio.autoplay=true
			this.audio.loop=true
			this.audio.obeyMuteSwitch=true
			// this.audio.play()
			this.audio.title="斗地主来自QQ音乐"
			this.audio.onError(err=>{
				console.log(err,'audio err');
			})
		},
		setup() {
			let user_cards=reactive([])
			let audio=reactive(null)
			return {user_cards,audio}
		}
	}
</script>

<style lang="less">
.container{
	height:100%;
	width:100%;
	&>.cards{
		width:100%;
		height:100%;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		background-color: black;
		grid-gap: 10px;
		&>.card{
			border: 5px solid red;
			box-sizing: border-box;
			display: flex;
			background-color: white;
			font-size:30px;
			border-radius: 10px;
			justify-content:center;
			padding:20px 0 0 0;
		}
	}
}
</style>
