// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.292
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平：要做到全村最好的房子是学校", "以色列与西班牙爆发激烈外交冲突", "应急局回应山东现不明飞行物被击落", "致敬英烈！运-20舱内视角看歼-20护航", "北京冰雹：车盖被砸出“气泡膜”", "朱一龙获金熊猫奖影帝", "美国夫妇遇充电求助好心开门被杀", "大量巴勒斯坦人排成长队被以军押送", "何超琼现身福耀科技大学开学典礼", "治理“电鸡”乱象 一线城市出手了", "市长凌晨暗访发现问题责令停工", "警方辟谣峨眉山猴子被击毙", "张兰进麻六记后厨直播被曝无健康证", "无人机进波兰领空 中方呼吁各方克制", "反转？柯克枪击案牵出美国神秘团体", "女童被蜜蜂蜇伤30分钟后不幸身亡", "特朗普：北约对中国加税有助于停战", "这些新大学分数赶超“985”", "以再空袭加沙：像火山喷发摧毁一切", "金与正：美日韩在朝周边秀肌肉选错地", "新华社：不怕你预制 怕你不告诉我", "微信公告：这种行为或永久限制登录", "女子表演与蟒蛇亲嘴 未张嘴就遭攻击", "钓鱼爱好者河边钓上来30多枚子弹", "张曼玉钻鸡窝取鸡蛋", "网友拍到北京的“冰河时代”", "吴镇宇获金熊猫最佳男主角奖", "印度空军拟购买114架法国阵风战斗机", "“餐厅是否使用预制菜”将强制披露", "为什么“窝囊游”越来越流行", "实拍北京冰雹：像天空在倒冰块", "意大利97天暑假结束仍热得上不了学", "#北京又又又下冰雹了#", "唐嫣获金熊猫最佳女主角", "泡泡玛特新品发售仅10人排队", "官方回应车在成都罚单却从重庆来", "孙颖莎逆转迪亚兹 国乒女单包揽四强", "柯文哲交保遭撤销 柯妈妈哽咽", "以总理暗示继续清除哈马斯领导层", "上合谴责以色列空袭卡塔尔声明", "海底捞索赔2000万为何难获支持", "白岩松专访詹姆斯完整版", "中方对美产相关模拟芯片发起调查", "台湾一卡车撞桥油箱飞出瞬间爆燃", "西藏日喀则市定日县发生3.4级地震", "特朗普称要“派兵” 美市长轻蔑一笑", "王曼昱4比0朱雨玲 晋级澳门赛四强", "“杨靖宇支队”战旗荣归吉林", "国乒男单仅王楚钦晋级澳门赛四强", "《哪吒2》获金熊猫奖最佳动画片奖", "福建舰首次远海训练 美英日在紧张啥"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
