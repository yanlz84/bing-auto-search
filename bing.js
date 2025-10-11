// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.346
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
var default_search_words = ["赋能“她力量” 中国在行动", "朝鲜举行盛大阅兵式", "美股暴跌 遭遇“黑色星期五”", "中国人口预期寿命不断提高", "中方一个个点名多个国家劣迹", "马云成龙贝克汉姆并排观赛", "“纹面男孩”称再洗2次纹身就干净了", "美国加州街头如恐怖片现场", "全球每8人就有1人患精神疾病", "中方强烈谴责美方无端遣返中国公民", "纳斯达克中国金龙指数收跌6.1%", "官方辟谣医保可报销药品仅占2%", "辽宁一小学开学1个月后关闭", "干部痴迷“翻翻鸽” 4年受贿95只", "美国一军用炸药厂大爆炸 建筑被夷平", "商务部：中方反制美方是正当防卫", "德雷克海峡发生7.6级地震", "普京：俄已经掌握了一种新型武器", "白宫官员：裁员已启动", "养猪场丢失20多头猪发现多支箭头", "起诉王者荣耀的律师贴吧独家回应", "白鹿回应暴瘦到86斤", "下雨天女儿请吊车帮父母收玉米", "七次大清理 故宫到底有多少件宝贝", "记者违规拍摄新武器并播出导致泄密", "向华强发声明否认破产", "中国商人巴西遭抢劫 电脑挡下一枪", "“X世代”成为全球最高消费群体", "假期动物园内动物已吃出“工伤”", "姚明成龙贝克汉姆NBA中国赛同框", "法国已辞职总理再被任命为总理", "首张“职业弹幕人”罚单开出", "多地考编打破35岁门槛", "中国成俄游客第二大海外旅游目的地", "学生毕业44年自驾400公里看初中老师", "离家时爷爷哽咽叮嘱不准对孙女暴力", "中国载人登月“进度条”持续刷新", "哈马斯拒绝接受加沙被外国托管", "鸡排好吃足矣 何必打扰鸡排哥", "乌美正就“战斧”导弹供应开展对话", "高通被立案调查", "中足联连开三张罚单", "菲律宾强震已致7人死亡", "也门举行集会庆祝加沙停火协议生效", "约20万人返回加沙北部地区", "张继科回应带货争议", "姆巴佩传射建功 法国3-0阿塞拜疆", "台湾男子骑摩托车从高架桥上坠落", "男子被关295天后无罪释放 获赔21万", "全运乒乓球“神仙打架” 难度超奥运", "男孩后空翻碰倒靠垫 女孩出手相助"]

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
