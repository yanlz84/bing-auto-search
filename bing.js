// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.330
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
var default_search_words = ["最深沉、最持久的情感所系", "九三阅兵受阅部队集结画面首次公开", "这个假期汽车托运火了 比租车省钱", "打卡照虽美 但这些出片方式不可取", "普京：如果俄是纸老虎 那北约算什么？", "鸡排哥谈收入笑称“还没赚到1个亿”", "女子车停路边被狗啃到面目全非", "联合国秘书长强烈谴责英国恐袭事件", "世界第一高楼再度点亮“中国红”", "台“网红”被曝带团队到灾区拍短片", "乌克兰宣布与尼加拉瓜断交", "国庆别再被这些谣言骗局忽悠了", "游客登泰山遇大风降雨 厕所挤满人", "游本昌演完《繁花》5年没走出来", "差2分钟高速免费 小车龟速行驶致拥堵", "美日澳24架F-35A出动集结日本", "广西多个知名景区公告：暂停开放", "演唱会出轨门男主戴婚戒与妻散步", "被秋老虎“硬控”了", "韩国75万公务员约7年工作文件全没了", "多个高速服务区回应排队叫号充电", "普京：美供乌“战斧”将引发局势升级", "深圳地铁列车能自己洗澡睡觉", "最忙的“摄影师”出现了", "快餐店回应员工用筷子桶装水擦桌椅", "章莹颖男友国庆探望章父并协助直播", "杨宗纬右手骨裂肋骨断裂 本人回应", "中方向美国驻港总领事提出严正交涉", "一不小心成了“全国团宠”", "美防长宣布军人“剃须令”", "普京：乌克兰冲突本可避免", "男子将猫关进快递柜转身就走", "伊朗防长：伊朗军队时刻备战", "“驾驶员同志 车速提起来”", "上海收藏家拟捐价值数十亿藏品", "王曼昱回应“日乒面前的叹息之墙”", "三组三胞胎国庆节强势出游", "女兵写请战书驾驶歼-16", "敦煌鸣沙山又双叒叕堵骆驼了", "高速充电桩“排队叫号”高峰已过", "狗被车碾压因太胖毫发无损", "中国游客回忆日本列车与卡车相撞", "飞行员讲述驱离外军隐身战机细节", "王楚钦称和孙颖莎沟通非常高效", "星海湾大桥一灯一鸥列队欢迎游客", "普京：恢复与美全面关系符合俄方利益", "再次“停摆” 美国这是怎么了", "重庆开启宠客模式 洪崖洞封桥又封路", "从军32年 他被战友称为“坦克兵王”", "浙江一景区设单向透明玻璃厕所", "中国男子在普吉岛被海浪冲走失联"]

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
