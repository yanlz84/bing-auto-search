// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.446
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
var default_search_words = ["感悟跨越百年的鼓岭情缘", "高市开始“甩锅” 日媒都看不下去了", "奶精加淀粉做成假奶粉销往全国", "流感季防护 这些误区要避开", "福建一大坝偷工减料？中国电建通报", "国考打破35岁门槛后 他们决定去考公", "中国驻日本大使《人民日报》发文", "2026年国考开考 热门岗位六千挑一", "跳水式降温来了！全国多地冷到发紫", "女子地铁内蹲坐被压骨折 获赔15万", "美国要对委内瑞拉动手了", "警方辟谣“女学生被捂鼻强拖”", "俄罗斯洲际弹道导弹爆炸", "“日本跟中国不是一个量级的”", "村民用了多年的垫脚石竟是恐龙化石", "300元滑雪服被冻哭的年轻人焊身上了", "中国女足0比8惨败英格兰女足", "电动自行车新国标将全面落地", "女子做磁共振两次黑屏竟因化了妆", "男子花1年定制2米高可通话摩托罗拉", "女子150万竞得32间法拍房6年未交付", "香港全城悼念火灾遇难者", "宛如画卷！黑龙江一湖面现龙鳞冰奇观", "袁惟仁被送急诊 2022年被判植物人", "年卖10亿的凤爪大王培养侄子上位", "全国流感阳性率45% 进入中流行水平", "旅行社：中国赴日团体游几乎全部取消", "“我独自走了所有和你去过的地方”", "3名中国人遇袭身亡 阿富汗强烈谴责", "“零容忍”是对缉毒英雄最好的致敬", "普京：G7越来越小为啥叫“七大国”", "男子动物园挑逗老虎被咬 当地回应", "间谍非法搜集亲本种子后果有多严重", "5岁女孩游乐园遭电击进ICU 家长发声", "支持严惩反中乱港分子“以灾乱港”", "“明谕琉球国王敕”在大连展出", "刘强东：未来机器人会完成所有工作", "牦牛冲进大学操场 学生吓到跨栏逃跑", "警惕！日本防卫开支达11万亿日元", "国产流感新药密集上市", "日本知名高校拟对留学生加收70%学费", "高中生跳高视频因酷似易烊千玺爆火", "广州“铜钱大厦”降1.36亿元仍流拍", "退休老人不抢鸡蛋抢起了船票", "美报告称“巴基斯坦胜利” 印度怒了", "农户监控拍到野生东北虎院外徘徊", "日方含糊其词无法蒙混过关", "日本部署中导只是第一步", "宁波东方理工大学正式揭牌成立", "东南亚骗婚调查：新娘“支持退换货”", "北平锋：高市和赖清德把台湾推向死局"]

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
