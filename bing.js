// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.339
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
var default_search_words = ["“家和万事兴”", "多地发文：招人 只要退休的", "150斤男生下床抵门被台风掀开四五次", "今天起全国公路迎来返程车流高峰", "大厂最卷新品 长在丈夫们的耳朵上", "没人住的房子为啥“老”得特别快", "中国人放假 东非大草原都堵车了", "103岁哥哥参加100岁弟弟生日宴", "微信又更新了 撤回消息有大变化", "山东一音乐节疑似大量人员冲卡逃票", "“05后”男子拒服兵役被罚8.64万", "3人造谣“新郎因加彩礼跳河”被罚", "34岁男子列车上猥亵7岁女童被刑拘", "返程“聪明人”在高速上又精准相遇", "福建太姥山一180斤游客卡在石缝里", "苏超淘汰赛：南通vs淮安", "十五的月亮十六圆", "中国研究出可弯折20000次柔性电池", "冰岛一大巴侧翻 车上一半是中国游客", "女子订到“餐景房” 拉开窗帘是餐厅", "距离下一个假期还有85天", "“父母恨不得把整个家给我打包”", "中国游客在帕劳潜水像下饺子", "国庆长假 6位平凡人感动亿万网友", "红白事“狭路相逢” 到底谁让谁", "小伙和女友餐厅吃饭被民警戴铐带走", "特朗普吐槽“环保少女”：她是麻烦精", "女方悔婚退彩礼时要扣3万拥抱费", "北汽声明：翻车与我集团无关", "“鸡排哥”回应被赵露思模仿", "中国征服“死亡之海”", "美93岁地产首富和33岁儿子决裂", "人人人返程人人人", "2名中国游客在马来西亚失联", "“鸡排大道”出现“鸡排哥”挑战者", "俄军试射洲际弹道导弹画面曝光", "两个菜被收661元顾客称获退款400元", "85岁麻生太郎成为高市早苗副手", "萧敬腾称自己被赶出了西安", "高市早苗为何被称“女版安倍”", "房企巨头上海总部大楼被6折甩卖", "让学生从家长身上踩过 涉事学校致歉", "诺奖新得主创立公司获数亿美元投资", "女子旅游8分钟劝回欲跳海男子", "加沙在流血以色列在分裂 美国在军援", "国乒今天诞生两位“万分王”", "#国庆返程高速堵成停车场#", "游客获西安大爷现场教学拍城墙水槽", "一个月内法国两位总理为何接连辞职", "黑龙江漠河迎来雨雪天气", "国际金价半年涨了1000美元"]

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
