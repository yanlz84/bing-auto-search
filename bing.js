// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.153
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
var default_search_words = ["习近平总书记的这番话掷地有声", "壶口瀑布再现50元人民币上的壮阔", "毕业即失业 无人机培训该降虚火了", "汛期露营避开这些风险", "地震频发 日本第二批岛民撤离避难", "被吹上天的国产片也翻车了", "网警护航高考：警惕花钱改分骗局", "王晶曝张曼玉秘闻：她当年也是花瓶", "小米YU7首批交付 雷军为车主开车门", "20岁女生徒步失联 家属说是最坏结果", "直击苏超：淮安vs常州", "吃野生菌一家7人被毒死？谣言", "暑假开始家长晒账单：已花费超2万元", "16个外甥又到舅舅家过暑假了", "3对母女包车游坠河 2死5失联", "郭晶晶夫妇参观山东舰 体验枪械操作", "公安部：中缅泰将全面清剿电诈园区", "罗马仕道歉 深圳成立小组督促召回", "马斯克回应对特朗普“由爱转恨”", "#马斯克的美国党能撬动两党吗#", "尹锡悦接受叛国罪调查 最高刑罚死刑", "马斯克宣布“美国党”成立", "马斯克的“美国党”或遭联合打压", "当地回应游客包车游川西坠崖落水", "金世佳方回应身份证掉了", "湖南资兴船只侧翻2人遇难", "捡到金世佳身份证当事人发声", "马斯克回应“参选时间”：明年", "美国得州洪灾死亡人数升至51人", "国际球星想应聘苏超暑假工", "中方对欧盟医疗器械采取相关措施", "多方回应幼儿园违规用添加剂事件", "王楚钦回应莎头组合能否复制", "中国网评论：砸窗非“英雄之举”", "船只侧翻 知情人：劝乘客回舱时突发", "台风丹娜丝或走出“Z字型”路径", "23名死亡人员领高龄津贴已全部追回", "任鲁豫蓝羽参加电影节被拦：没带证件", "石破茂：与美关税谈判不会轻易妥协", "官方回应苏超南京队长不文明动作", "男子误杀邻居宠物螳螂赔偿400元", "3名初中生偷奔驰致严重车祸保险拒赔", "罗马仕员工回应停工停产：感觉被抛弃", "马斯克被警告会成为一个没国家的人", "袁立晒健身照自曝瘦了15斤", "日本教材污蔑卢沟桥事变中方先开枪", "田栩宁方声明目前单身", "任贤齐自罚签名2000张", "男子奶茶被盗打110 民警14分钟追回", "男子长期性侵未成年养女被判死刑", "马斯克或需数千名捐款人资助美国党"]

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
