// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.199
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
var default_search_words = ["习近平对防汛救灾工作作出重要指示", "中资矿企遭抢劫 一中国公民中弹身亡", "人均500块的宫廷饭爆火", "暴雨来袭 这些地方不要去", "深圳央企被曝大量员工资金被套", "育儿补贴能刺激大家多生孩子吗", "中方回应是否已邀请特朗普访华", "少林寺新住持此前任白马寺方丈", "《南京照相馆》导演被P遗照", "年轻人的工资流入“一金一银”", "武大性骚扰事件女生疑读博 高校回应", "长江游船倒扣18人下落不明？谣言", "印乐法师任少林寺住持", "“钱和车都没了 但我救了1个人”", "凌晨三点 被掏空的年轻人还在抓大鹅", "北京：确保密云水库绝对安全", "韩国87元一碗的排骨汤全是大肥肉", "新住持已到寺 少林寺历代住持都有谁", "中方回应普京特朗普9月或在华会晤", "暴雨洪水中丈夫大喊：先救我媳妇", "《凡人修仙传》热度破万", "男子长期网购退货私吞800件赠品获刑", "#北京此轮强降雨到底有多大#", "男子凌晨偷2261斤大蒜 塞爆副驾", "#为什么北京这次极端暴雨这么厉害#", "航拍北京密云洪水：遍地泥泞", "湖南一地天降多块不明物体 当地回应", "中国女孩在欧洲跨国航班上客串空姐", "雷暴大雨 成都突降冰雹", "天津蓟州爆发70年来最大山洪", "女子卖劳力士收32万后银行卡被冻结", "上海药皂被曝含有苏丹红 客服回应", "大同标语翻译现美国与美国共享世界", "妹妹心肌炎去世 哥哥患同种病进ICU", "外交部回应美国拒绝赖清德“过境”", "疑似武汉大学微博小编发贴", "当地回应14岁女生解约MCN反被索赔", "英防相妄称台海若冲突英国或介入", "95后研究生博主卖创意烧饼涨粉40万", "“百名红通人员”梁锦文回国投案", "iPhone 17 Pro原型机曝光", "网红罗大美案始末：转账200万仍被害", "受贿8191万余元 杜梓一审获刑15年", "24岁女生漂流景区落水失联 亲属发声", "村民暴雨中敲窗喊醒邻居逃生", "七八月的欧洲被游客挤爆了", "小狗被关哈啰宠物快车后备箱闷死", "车辆被暴雨冲走能申请全款赔偿吗", "印度医生值班睡觉致重伤患者死亡", "杨洋谈《凡人修仙传》最深刻的戏", "浙江宁波一房屋发生爆炸后倒塌"]

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
