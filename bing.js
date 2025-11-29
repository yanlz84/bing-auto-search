// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.445
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
var default_search_words = ["持续营造风清气正的网络空间", "香港此前失踪名单中144人确认安全", "全国流感阳性率45% 进入中流行水平", "12月起这些新规将影响你我生活", "狂风暴雪局地骤降20℃ 强冷空气来袭", "日本“撑伞架枪” 解放军有底气", "净网：网警斩断非法引流黑手", "香港大埔火灾仍有150人失联", "俄罗斯洲际弹道导弹爆炸", "大叔挖蚯蚓挖出60斤千年“大宝贝”", "老君山景区拒绝用无人机取代挑山工", "警方辟谣“女学生被捂鼻强拖”", "特朗普长子成2028美国总统大选热门", "云南25岁缉毒警牺牲时仍紧扣扳机", "大脑“断崖式衰老”的3个年龄", "香港市民自发参加悼念", "英国女警卧底5年爱上监控对象闪婚", "多名干部被指用“人脸面具”刷考勤", "儿子举报父亲偷电瓶 民警现场叹息", "土耳其交付9200辆新执法车停满机场", "宏福苑两栋大厦搜索完成 未发现遗体", "300元滑雪服被冻哭的年轻人焊身上了", "罗大美遗体停放超28个月 二审将开庭", "袁惟仁被送急诊 2022年被判植物人", "退休老人不抢鸡蛋抢起了船票", "女孩回应打包婚宴剩菜喂养流浪猫", "吃到七八分饱到底是啥感觉", "刘强东：未来机器人会完成所有工作", "斯里兰卡总统宣布全国进入紧急状态", "男子花1年定制2米高可通话摩托罗拉", "广东消防支援香港多台套救援装备", "旅行社：中国赴日团体游几乎全部取消", "12月中国赴日航班已取消904个", "西班牙专家：日本从未承认过历史真相", "两个“1980” 苏翊鸣强势夺金", "长沙连续17年获中国最具幸福感城市", "国务院安委会部署排查高层火灾隐患", "高市打出“废约”牌 有何险恶用心", "黑海再次发生油轮遭袭事件", "荒野求生决赛建弟因身体不适退赛", "香港捐助基金和政府拨款达11亿港元", "黄河壶口瀑布现“彩虹横卧”景观", "泽连斯基助手辞职后称要“奔赴前线”", "曝Kim重返LPL", "航油“巨无霸”真的要来了", "日本民众集会 举牌称“高市是国难”", "灵隐寺免门票首日入园名额已约满", "律师解读吸毒记录封存：不是彻底清除", "女童甲流高烧脸颊测温秒升38度", "“中国金王”陈景河宣布退休", "中国军警同一天在黄岩岛行动"]

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
